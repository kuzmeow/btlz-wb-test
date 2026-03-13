import { sheetService, type SheetService } from "#modules/sheet/service.js";
import { tariffService, type TariffService } from "#modules/tariff/service.js";
import type { SheetEntity } from "#modules/sheet/entity.js";
import type { TariffEntity } from "#modules/tariff/entity.js";
import { runWithConcurrency, TaskResult } from "#infra/concurrent/runWithConcurrency.js";

export class ExportService {
    constructor(
        private readonly sheetService: SheetService,
        private readonly tariffService: TariffService,
    ) {}

    async registerAndUpdateSpreadsheet(spreadsheetId: string, tariffDate?: Date) {
        const fetchDate = tariffDate ?? new Date();
        const tariff = await this.tariffService.getOneAndUpdateByFetchDate(fetchDate);
        await this.sheetService.registerSpreadsheet(spreadsheetId, tariff.id, tariffDate);
        await this.updateAllSheetsForTariff(tariff);
    }

    async updateAllSheetsForTariff(tariff: TariffEntity): Promise<SheetEntity[]> {
        const sheets = await this.sheetService.getManyForTariff(tariff.id);

        if (sheets.length === 0) {
            console.log("No sheets found for tariff");
            return [];
        }

        console.log(`Updating ${sheets.length} sheets...`);

        const results = await runWithConcurrency(
            sheets.map((sheet) => async () => {
                const updated = await this.sheetService.updateSpreadsheet(sheet, tariff);
                return updated;
            }),
            5,
        );

        const success = results.filter((r: TaskResult<SheetEntity>) => r.status === "fulfilled");
        const failed = results.filter((r: TaskResult<SheetEntity>) => r.status === "rejected");
        if (failed.length > 0) {
            console.warn(`Failed sheets:`);
            failed.forEach((f) => console.warn(`   - ${f.reason}`));
        }

        return success.map((r) => r.value);
    }

    async fullUpdateForDate(fetchDate?: Date) {
        const tariff = await this.tariffService.getOneAndUpdateByFetchDate(fetchDate);

        if (!fetchDate) {
            const sheetsForCurrent = await this.sheetService.getManyOutdatedCurrent(tariff.id);
            await Promise.all(
                sheetsForCurrent.map(async (s) => {
                    s.tariffId = tariff.id;
                    await this.sheetService.save(s);
                }),
            );
        }

        await this.updateAllSheetsForTariff(tariff);
    }
}

export const exportService = new ExportService(sheetService, tariffService);
