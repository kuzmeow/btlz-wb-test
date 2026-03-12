import { toCamelCase } from "#infra/caseConvertors/toCamelCase.js";
import { toSnakeCase } from "#infra/caseConvertors/toSnakeCase.js";
import knex from "#postgres/knex.js";
import { z } from "zod";
import { TariffEntity, TariffEntitySchema, TARIFFS_TABLE_NAME } from "./entity.js";
import { WarehouseService, warehouseService } from "#modules/warehouse/service.js";
import { Tariff } from "./schema.js";

export class TariffRepository {
    constructor(private readonly warehouseService: WarehouseService) {}

    async create(data: Tariff, fetchDate: Date): Promise<TariffEntity> {
        const { warehouseList: _, ...rest } = data;
        const [created] = await knex(TARIFFS_TABLE_NAME)
            .insert(toSnakeCase({ ...rest, lastFetchDate: fetchDate }))
            .returning("*");
        return this.validateOne(created);
    }

    async save(data: TariffEntity): Promise<TariffEntity> {
        const [updated] = await knex(TARIFFS_TABLE_NAME)
            .where({ id: data.id })
            .update({
                ...toSnakeCase({ ...data, warehouses: undefined }),
                updated_at: knex.fn.now(),
            })
            .returning("*");

        if (!updated) {
            throw new Error(`Tariff with id ${data.id} not found`);
        }

        return this.validateOne(updated);
    }

    async getOneWithWarehouses(condition: Partial<TariffEntity>): Promise<TariffEntity | null> {
        const query = knex(TARIFFS_TABLE_NAME);

        Object.entries(toSnakeCase(condition)).forEach(([key, value]) => {
            if (value !== undefined) {
                query.where(key, value);
            }
        });

        const record = await query.first();
        if (!record) return null;
        const tariff = this.validateOne(record);

        tariff.warehouses = await this.warehouseService.getManyForTariff(tariff.id);
        return tariff;
    }

    private validateOne(record: unknown): TariffEntity {
        try {
            return TariffEntitySchema.parse(toCamelCase(record as Record<string, any>));
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`TariffEntity validation failed:\n${error}`);
            }
            throw error;
        }
    }
}

export const tariffRepository = new TariffRepository(warehouseService);
