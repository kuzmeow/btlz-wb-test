import { BaseEntitySchema } from "#common/entity.js";
import { z } from "zod";
import { WarehouseSchema } from "./schema.js";

export const WAREHOUSES_TABLE_NAME = "warehouses";
export const WAREHOUSE_PG_TYPES: Record<string, string> = {
    id: "uuid",
    tariff_id: "uuid",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
    box_delivery_base: "numeric",
    box_delivery_coef_expr: "numeric",
    box_delivery_liter: "numeric",
    box_delivery_marketplace_base: "numeric",
    box_delivery_marketplace_coef_expr: "numeric",
    box_delivery_marketplace_liter: "numeric",
    box_storage_base: "numeric",
    box_storage_coef_expr: "numeric",
    box_storage_liter: "numeric",
    geo_name: "character varying",
    warehouse_name: "character varying",
};

export const WarehouseEntitySchema = BaseEntitySchema.merge(WarehouseSchema).extend({
    tariffId: z.string().uuid(),
});

export type WarehouseEntity = z.infer<typeof WarehouseEntitySchema>;
