import { BaseEntitySchema } from "#common/entity.js";
import { z } from "zod";
import { TariffSchema } from "./schema.js";
import { WarehouseEntitySchema } from "#modules/warehouse/entity.js";

export const TARIFFS_TABLE_NAME = "tariffs";

export const TariffEntitySchema = BaseEntitySchema.merge(TariffSchema.omit({ warehouseList: true })).extend({
    lastFetchDate: z.date(),
    warehouses: z.array(z.lazy(() => WarehouseEntitySchema)).optional(),
});

export type TariffEntity = z.infer<typeof TariffEntitySchema>;
