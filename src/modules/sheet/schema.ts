import { getFieldDescriptions } from "#infra/schema/field/getDescriptions.js";
import { nullableDate } from "#infra/schema/field/preprocessors/nullableDate.js";
import { TariffEntitySchema } from "#modules/tariff/entity.js";
import { WarehouseSchema } from "#modules/warehouse/schema.js";
import { z } from "zod";

export const SheetSchema = z.object({
    spreadsheetId: z.string(),
    tariffDate: nullableDate(),
    tariffId: z.string().uuid(),
});

export type Sheet = z.infer<typeof SheetSchema>;

export const SheetTariffSchema = TariffEntitySchema.omit({ id: true, createdAt: true, warehouses: true });
export const SheetWarehouseSchema = WarehouseSchema;

export const sheetTariffDesc = getFieldDescriptions(SheetTariffSchema);
export const sheetWarehouseDesc = getFieldDescriptions(SheetWarehouseSchema);
