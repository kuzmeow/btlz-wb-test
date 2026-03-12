import { optionalDate } from "#infra/schemaPreprocessors/optionalDate.preprocessor.js";
import { WarehouseSchema } from "#modules/warehouse/schema.js";
import { z } from "zod";

export const TariffsSchema = z.object({
    dtNextBox: optionalDate(),
    dtTillMax: optionalDate(),
    warehouseList: z.array(WarehouseSchema),
});

export type Tariffs = z.infer<typeof TariffsSchema>;
