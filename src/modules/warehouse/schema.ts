import { nullableNumber } from "#infra/schema/field/preprocessors/nullableNumber.js";
import { z } from "zod";

export const WarehouseSchema = z.object({
    boxDeliveryBase: nullableNumber().describe("Логистика: 1-й литр (₽)"),
    boxDeliveryCoefExpr: nullableNumber().describe("Логистика: коэффициент (%)"),
    boxDeliveryLiter: nullableNumber().describe("Логистика: доп. литр (₽)"),
    boxDeliveryMarketplaceBase: nullableNumber().describe("FBS: 1-й литр (₽)"),
    boxDeliveryMarketplaceCoefExpr: nullableNumber().describe("FBS: коэффициент (%)"),
    boxDeliveryMarketplaceLiter: nullableNumber().describe("FBS: доп. литр (₽)"),
    boxStorageBase: nullableNumber().describe("Хранение: 1-й литр (₽/д)"),
    boxStorageCoefExpr: nullableNumber().describe("Хранение: коэффициент (%)"),
    boxStorageLiter: nullableNumber().describe("Хранение: доп. литр (₽/д)"),
    geoName: z.string().describe("Страна / Регион РФ"),
    warehouseName: z.string().describe("Склад"),
});

export type Warehouse = z.infer<typeof WarehouseSchema>;
