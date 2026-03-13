import { toSnakeCase } from "#infra/caseConvertors/toSnakeCase.js";
import knex from "#postgres/knex.js";
import { z } from "zod";
import { WAREHOUSES_TABLE_NAME, WAREHOUSE_PG_TYPES, WarehouseEntity, WarehouseEntitySchema } from "./entity.js";
import { Warehouse } from "./schema.js";
import { toCamelCase } from "#infra/caseConvertors/toCamelCase.js";
import { batchUpdate } from "#infra/knex/batchUpdate.js";

export class WarehouseRepository {
    async create(tariffId: string, data: Warehouse): Promise<WarehouseEntity> {
        const [created] = await knex(WAREHOUSES_TABLE_NAME)
            .insert(toSnakeCase({ ...data, tariffId }))
            .returning("*");

        return this.validateOne(created);
    }

    async createMany(tariffId: string, data: Warehouse[]): Promise<WarehouseEntity[]> {
        if (data.length === 0) return [];

        const records = data.map((item) => toSnakeCase({ ...item, tariffId }));

        const created = await knex(WAREHOUSES_TABLE_NAME).insert(records).returning("*");

        return this.validateMany(created);
    }

    async save(data: WarehouseEntity): Promise<WarehouseEntity> {
        const [updated] = await knex(WAREHOUSES_TABLE_NAME)
            .where({ id: data.id })
            .update({
                ...toSnakeCase(data),
                updated_at: knex.fn.now(),
            })
            .returning("*");

        if (!updated) {
            throw new Error(`Warehouse with id ${data.id} not found`);
        }

        return this.validateOne(updated);
    }

    async saveMany(data: WarehouseEntity[]): Promise<WarehouseEntity[]> {
        if (data.length === 0) return [];

        return knex.transaction(async (trx) => {
            const snakeData = data.map((item) => toSnakeCase(item));

            const results = await batchUpdate(trx, {
                tableName: WAREHOUSES_TABLE_NAME,
                data: snakeData,
                idField: "id",
                pgTypes: WAREHOUSE_PG_TYPES,
            });

            if (results.length !== data.length) {
                const updatedIds = new Set(results.map((r) => r.id));
                const missingIds = data.map((item) => item.id).filter((id) => !updatedIds.has(id));
                throw new Error(`Failed to update warehouses: ${missingIds.join(", ")}`);
            }

            return this.validateMany(results);
        });
    }

    async delete(condition: Partial<WarehouseEntity>): Promise<number> {
        const query = knex(WAREHOUSES_TABLE_NAME);

        Object.entries(toSnakeCase(condition)).forEach(([key, value]) => {
            if (value !== undefined) {
                query.where(key, value);
            }
        });

        const deletedCount = await query.del();
        return deletedCount;
    }

    async getMany(
        condition: Partial<WarehouseEntity> = {},
        options: {
            limit?: number;
            offset?: number;
            orderBy?: string;
            orderDirection?: "asc" | "desc";
        } = {},
    ): Promise<WarehouseEntity[]> {
        const query = knex(WAREHOUSES_TABLE_NAME);

        Object.entries(toSnakeCase(condition)).forEach(([key, value]) => {
            if (value !== undefined) {
                query.where(key, value);
            }
        });

        if (options.limit) query.limit(options.limit);
        if (options.offset) query.offset(options.offset);
        if (options.orderBy) {
            query.orderBy(options.orderBy, options.orderDirection || "asc");
        } else {
            query.orderBy("id", "asc");
        }

        const records = await query;
        return this.validateMany(records);
    }

    private validateOne(record: Record<string, any>): WarehouseEntity {
        try {
            return WarehouseEntitySchema.parse(toCamelCase(record));
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`WarehouseEntity validation failed:\n${error}`);
            }
            throw error;
        }
    }

    private validateMany(records: Record<string, any>[]): WarehouseEntity[] {
        return records.map((record) => this.validateOne(record));
    }
}

export const warehouseRepository = new WarehouseRepository();
