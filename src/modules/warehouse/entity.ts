import { BaseEntitySchema } from "#common/entity.js";
import { z } from "zod";
import { WarehouseSchema } from "./schema.js";

export const TABLE_NAME = "warehouses";

export const WarehouseEntitySchema = BaseEntitySchema.merge(WarehouseSchema);

export type WarehouseEntity = z.infer<typeof WarehouseEntitySchema>;
