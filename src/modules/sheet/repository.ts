import { toCamelCase } from "#infra/caseConvertors/toCamelCase.js";
import { toSnakeCase } from "#infra/caseConvertors/toSnakeCase.js";
import knex from "#postgres/knex.js";
import { z } from "zod";
import { SheetEntity, SheetEntitySchema, SHEETS_TABLE_NAME } from "./entity.js";
import { Sheet } from "./schema.js";

export class SheetRepository {
    async create(data: Sheet): Promise<SheetEntity> {
        const [created] = await knex(SHEETS_TABLE_NAME)
            .insert(toSnakeCase({ ...data }))
            .returning("*");
        return this.validateOne(created);
    }

    async save(data: SheetEntity): Promise<SheetEntity> {
        const [updated] = await knex(SHEETS_TABLE_NAME)
            .where({ spreadsheet_id: data.spreadsheetId })
            .update({
                ...toSnakeCase(data),
                updated_at: knex.fn.now(),
            })
            .returning("*");

        if (!updated) {
            throw new Error(`Sheet with id ${data.spreadsheetId} not found`);
        }

        return this.validateOne(updated);
    }

    async getOne(condition: Partial<SheetEntity>): Promise<SheetEntity | null> {
        const query = knex(SHEETS_TABLE_NAME);

        Object.entries(toSnakeCase(condition)).forEach(([key, value]) => {
            if (value !== undefined) {
                query.where(key, value);
            }
        });

        const record = await query.first();
        return record ? this.validateOne(record) : null;
    }

    async delete(condition: Partial<SheetEntity>): Promise<number> {
        const query = knex(SHEETS_TABLE_NAME);

        Object.entries(toSnakeCase(condition)).forEach(([key, value]) => {
            if (value !== undefined) {
                query.where(key, value);
            }
        });

        const deletedCount = await query.del();
        return deletedCount;
    }

    private validateOne(record: Record<string, any>): SheetEntity {
        try {
            return SheetEntitySchema.parse(toCamelCase(record));
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`SheetEntity validation failed:\n${error}`);
            }
            throw error;
        }
    }
}

export const sheetRepository = new SheetRepository();
