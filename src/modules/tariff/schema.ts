import { nullableDate } from "#infra/schema/field/preprocessors/nullableDate.js";
import { WarehouseSchema } from "#modules/warehouse/schema.js";
import { z } from "zod";

export const TariffSchema = z.object({
    dtNextBox: nullableDate().describe("След. тариф"),
    dtTillMax: nullableDate().describe("Конец актуального тарифа"),
    warehouseList: z.array(WarehouseSchema),
});

export type Tariff = z.infer<typeof TariffSchema>;
