import { BaseEntitySchema } from "#common/entity.js";
import { z } from "zod";
import { SheetSchema } from "./schema.js";

export const SHEETS_TABLE_NAME = "sheets";

export const SheetEntitySchema = BaseEntitySchema.omit({ id: true }).merge(SheetSchema);

export type SheetEntity = z.infer<typeof SheetEntitySchema>;
