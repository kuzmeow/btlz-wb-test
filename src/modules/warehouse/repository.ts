import { toSnakeCase } from "#infra/caseConvertors/toSnakeCase.js";
import knex from "#postgres/knex.js";
import { z } from "zod";
import { TABLE_NAME, WarehouseEntity, WarehouseEntitySchema } from "./entity.js";
import { Warehouse } from "./schema.js";
import { toCamelCase } from "#infra/caseConvertors/toCamelCase.js";

export class WarehouseRepository {
    async create(data: Warehouse): Promise<WarehouseEntity> {
        const [created] = await knex(TABLE_NAME)
            .insert({ ...toSnakeCase(data) })
            .returning("*");

        return this.validateOne(created);
    }

    async createMany(data: Warehouse[]): Promise<WarehouseEntity[]> {
        if (data.length === 0) return [];

        const records = data.map((item) => ({ ...toSnakeCase(item) }));

        const created = await knex(TABLE_NAME).insert(records).returning("*");

        return this.validateMany(created);
    }

    async save(data: WarehouseEntity): Promise<WarehouseEntity> {
        const [updated] = await knex(TABLE_NAME)
            .where({ id: data.id })
            .update({
                ...toSnakeCase({ ...data }),
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

        const results: WarehouseEntity[] = [];

        await knex.transaction(async (trx) => {
            for (const item of data) {
                const [updated] = await trx(TABLE_NAME)
                    .where({ id: item.id })
                    .update({
                        ...toSnakeCase(item),
                        updated_at: trx.fn.now(),
                    })
                    .returning("*");

                if (!updated) {
                    throw new Error(`Warehouse with id ${item.id} not found during batch save`);
                }

                results.push(this.validateOne(updated));
            }
        });

        return results;
    }

    async delete(condition: Partial<WarehouseEntity>): Promise<number> {
        const query = knex(TABLE_NAME);

        Object.entries(toSnakeCase(condition)).forEach(([key, value]) => {
            if (value !== undefined) {
                query.where(key, value);
            }
        });

        const deletedCount = await query.del();
        return deletedCount;
    }

    async deleteById(id: string): Promise<boolean> {
        const deletedCount = await this.delete({ id });

        return deletedCount > 0;
    }

    async deleteManyByIds(ids: string[]): Promise<number> {
        if (ids.length === 0) return 0;

        const deletedCount = await knex(TABLE_NAME).whereIn("id", ids).del();

        return deletedCount;
    }

    async getOne(condition: Partial<WarehouseEntity>): Promise<WarehouseEntity | null> {
        const query = knex(TABLE_NAME);

        Object.entries(toSnakeCase(condition)).forEach(([key, value]) => {
            if (value !== undefined) {
                query.where(key, value);
            }
        });

        const record = await query.first();
        return record ? this.validateOne(record) : null;
    }

    async getOneById(id: string): Promise<WarehouseEntity | null> {
        return await this.getOne({ id });
    }

    async getManyWhere(
        condition: Partial<WarehouseEntity> = {},
        options: {
            limit?: number;
            offset?: number;
            orderBy?: string;
            orderDirection?: "asc" | "desc";
        } = {},
    ): Promise<WarehouseEntity[]> {
        const query = knex(TABLE_NAME);

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

    async getManyByIds(ids: string[]): Promise<WarehouseEntity[]> {
        if (ids.length === 0) return [];

        const records = await knex(TABLE_NAME).whereIn("id", ids).orderBy("id");

        return this.validateMany(records);
    }

    private validateOne(record: unknown): WarehouseEntity {
        try {
            return WarehouseEntitySchema.parse(toCamelCase(record as Record<string, any>));
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`WarehouseEntity validation failed:\n${error}`);
            }
            throw error;
        }
    }

    private validateMany(records: unknown[]): WarehouseEntity[] {
        return records.map((record) => this.validateOne(record));
    }
}

export const warehouseRepository = new WarehouseRepository();
