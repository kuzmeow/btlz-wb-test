import type { SheetRepository } from "./repository.js";
import type { SheetEntity } from "./entity.js";
import type { TariffEntity } from "#modules/tariff/entity.js";
import { sheets } from "#config/google/sheets.js";
import { sheets_v4 } from "googleapis";
import { sheetRepository } from "./repository.js";
import env from "#config/env/env.js";
import { sheetTariffDesc, SheetTariffSchema, sheetWarehouseDesc, SheetWarehouseSchema } from "./schema.js";
import { z } from "zod";
import { GaxiosResponse } from "gaxios";

export class SheetService {
    constructor(
        private readonly rep: SheetRepository,
        private readonly sheets: sheets_v4.Sheets,
        private readonly sheetName: string,
    ) {}

    async create(spreadsheetId: string, tariffDate: Date, tariffId: string): Promise<SheetEntity> {
        return await this.rep.create({ spreadsheetId, tariffDate, tariffId });
    }

    async registerSpreadsheet(spreadsheetId: string, tariffDate: Date, tariffId: string): Promise<SheetEntity> {
        const existingSheet = await this.rep.getOne({ spreadsheetId });

        if (existingSheet) {
            if (existingSheet.tariffDate !== tariffDate) return await this.rep.save({ ...existingSheet, tariffDate });
            return existingSheet;
        }

        return await this.create(spreadsheetId, tariffDate, tariffId);
    }

    async updateSpreadsheet(sheet: SheetEntity, tariff: TariffEntity): Promise<SheetEntity> {
        await this.ensureSheetExists(sheet.spreadsheetId);

        if (tariff.warehouses === undefined) {
            throw new Error("TariffEntity is not populated with warehouses. Cannot build SpreadSheet data row");
        }

        const tariffHeadersRow = Object.values(sheetTariffDesc);
        const tariffDataRow = this.buildDataRow(SheetTariffSchema, tariff);

        const warehouseHeadersRow = Object.values(sheetWarehouseDesc).map((v) => {
            return v.replace("Логистика: ", "").replace("FBS: ", "").replace("Хранение: ", "");
        });

        const warehouseDataRows = tariff.warehouses.map((w) => this.buildDataRow(SheetWarehouseSchema, w));

        const row1 = tariffHeadersRow;
        const row2 = tariffDataRow;
        const row3 = [""];
        const row4 = ["Логистика", "", "", "FBS", "", "", "Хранение", "", "", "Расположение"];
        const row5 = warehouseHeadersRow;

        const allRows = [row1, row2, row3, row4, row5, ...warehouseDataRows];
        const maxColLetter = this.colIndexToLetter(row5.length);

        await this.sheets.spreadsheets.values.update(
            {
                spreadsheetId: sheet.spreadsheetId,
                range: `${this.sheetName}!A1:${maxColLetter}${allRows.length}`,
                valueInputOption: "USER_ENTERED",
                requestBody: { values: allRows },
            },
            { responseType: "stream" },
        );

        await this.applyFormatting(sheet.spreadsheetId, {
            tariffCols: row1.length,
            warehouseCols: row5.length,
            totalRows: allRows.length,
        });

        return await this.rep.save(sheet);
    }

    async unregisterSpreadsheet(spreadsheetId: string) {
        await this.rep.delete({ spreadsheetId });
    }

    async getManyForTariff(tariffId: string): Promise<SheetEntity[]> {
        return await this.rep.getMany({ tariffId });
    }

    private buildDataRow<T extends Record<string, any>>(schema: z.ZodObject<any>, data: T): string[] {
        const fieldList = Object.keys(schema.shape) as (keyof T)[];

        return fieldList.map((field) => {
            if (!(field in data)) {
                console.warn(`Field "${String(field)}" not found in data`);
                return "";
            }
            const value = data[field];
            const fullDate = field === "updatedAt";

            return this.formatCellValue(value, fullDate);
        });
    }

    private formatCellValue(value: any, fullDate: boolean = false): string {
        if (value === null || value === undefined) return "";
        if (value instanceof Date) {
            const result = value.toISOString();
            if (fullDate) return result;
            return result.split("T")[0];
        }
        if (typeof value === "number") {
            return Number.isInteger(value) ? String(value) : value.toFixed(2);
        }
        return String(value);
    }

    private colIndexToLetter(index: number): string {
        let letter = "";
        while (index > 0) {
            const temp = (index - 1) % 26;
            letter = String.fromCharCode(temp + 65) + letter;
            index = Math.floor((index - temp) / 26);
        }
        return letter;
    }

    private async applyFormatting(
        spreadsheetId: string,
        config: { tariffCols: number; warehouseCols: number; totalRows: number },
    ) {
        try {
            const spreadsheet = await this.getSpreadSheet(spreadsheetId);

            const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === this.sheetName);
            if (!sheet?.properties?.sheetId) return;

            const sheetId = sheet.properties.sheetId;

            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            repeatCell: {
                                range: {
                                    sheetId,
                                    startRowIndex: 0,
                                    endRowIndex: 5,
                                    startColumnIndex: 0,
                                    endColumnIndex: config.warehouseCols,
                                },
                                cell: {
                                    userEnteredFormat: {
                                        textFormat: { bold: true },
                                    },
                                },
                                fields: "userEnteredFormat.textFormat.bold",
                            },
                        },
                        {
                            mergeCells: {
                                range: {
                                    sheetId,
                                    startRowIndex: 3,
                                    endRowIndex: 4,
                                    startColumnIndex: 0,
                                    endColumnIndex: 3,
                                },
                                mergeType: "MERGE_ALL",
                            },
                        },
                        {
                            mergeCells: {
                                range: {
                                    sheetId,
                                    startRowIndex: 3,
                                    endRowIndex: 4,
                                    startColumnIndex: 3,
                                    endColumnIndex: 6,
                                },
                                mergeType: "MERGE_ALL",
                            },
                        },
                        {
                            mergeCells: {
                                range: {
                                    sheetId,
                                    startRowIndex: 3,
                                    endRowIndex: 4,
                                    startColumnIndex: 6,
                                    endColumnIndex: 9,
                                },
                                mergeType: "MERGE_ALL",
                            },
                        },
                        {
                            mergeCells: {
                                range: {
                                    sheetId,
                                    startRowIndex: 3,
                                    endRowIndex: 4,
                                    startColumnIndex: 9,
                                    endColumnIndex: 11,
                                },
                                mergeType: "MERGE_ALL",
                            },
                        },
                        {
                            updateBorders: {
                                range: {
                                    sheetId,
                                    startRowIndex: 3,
                                    endRowIndex: 5,
                                    startColumnIndex: 0,
                                    endColumnIndex: config.warehouseCols,
                                },
                                top: { style: "SOLID" },
                                bottom: { style: "SOLID" },
                                left: { style: "SOLID" },
                                right: { style: "SOLID" },
                                innerVertical: { style: "SOLID" },
                                innerHorizontal: { style: "SOLID" },
                            },
                        },
                        {
                            updateBorders: {
                                range: {
                                    sheetId,
                                    startRowIndex: 5,
                                    endRowIndex: config.totalRows,
                                    startColumnIndex: 0,
                                    endColumnIndex: config.warehouseCols,
                                },
                                top: { style: "SOLID" },
                                bottom: { style: "SOLID" },
                                left: { style: "SOLID" },
                                right: { style: "SOLID" },
                                innerVertical: { style: "SOLID" },
                            },
                        },
                        {
                            repeatCell: {
                                range: {
                                    sheetId,
                                    startRowIndex: 0,
                                    endRowIndex: 2,
                                    startColumnIndex: 0,
                                    endColumnIndex: config.tariffCols,
                                },
                                cell: {
                                    userEnteredFormat: {
                                        backgroundColor: { red: 0.9, green: 0.95, blue: 1 },
                                    },
                                },
                                fields: "userEnteredFormat.backgroundColor",
                            },
                        },
                        {
                            autoResizeDimensions: {
                                dimensions: {
                                    sheetId,
                                    dimension: "COLUMNS",
                                    startIndex: 0,
                                    endIndex: config.warehouseCols,
                                },
                            },
                        },
                        {
                            setBasicFilter: {
                                filter: {
                                    range: {
                                        sheetId,
                                        startRowIndex: 4,
                                        endRowIndex: config.totalRows,
                                        startColumnIndex: 0,
                                        endColumnIndex: config.warehouseCols,
                                    },
                                    sortSpecs: [
                                        {
                                            dimensionIndex: 1,
                                            sortOrder: "ASCENDING",
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
            });
        } catch (error) {
            console.warn("Formatting skipped:", error);
        }
    }

    async ensureSheetExists(spreadsheetId: string): Promise<number> {
        const spreadsheet = await this.getSpreadSheet(spreadsheetId);
        const existingSheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === this.sheetName);

        if (existingSheet?.properties?.sheetId) {
            return existingSheet.properties.sheetId;
        }

        const response = await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: this.sheetName,
                            },
                        },
                    },
                ],
            },
        });

        const newSheetId = response.data.replies?.[0]?.addSheet?.properties?.sheetId;

        if (!newSheetId) {
            throw new Error(`Failed to create sheet "${this.sheetName}" for ${spreadsheetId} `);
        }

        console.log(`Created sheet "${this.sheetName}" for spreadsheet ${spreadsheetId}`);
        return newSheetId;
    }

    private async getSpreadSheet(spreadsheetId: string): Promise<GaxiosResponse<sheets_v4.Schema$Spreadsheet>> {
        try {
            return await this.sheets.spreadsheets.get({
                spreadsheetId,
                fields: "sheets(properties(sheetId,title))",
            });
        } catch (error) {
            if (error && typeof error === "object" && "status" in error && error.status === 403) {
                throw new Error(
                    `Cannot connect to spreadsheet ${spreadsheetId}. ` +
                        `Make sure that you have enabled editor access to service account`,
                );
            }
            throw error;
        }
    }
}

export const sheetService = new SheetService(sheetRepository, sheets, env.SHEET_NAME);
