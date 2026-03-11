import { optionalDate } from "#infra/schemaPreprocessors/optionalDate.preprocessor.js";
import { WarehouseSchema } from "#modules/warehouse/schema.js";
import { z } from "zod";

export const BoxTariffsSchema = z.object({
    dtNextBox: optionalDate(),
    dtTillMax: optionalDate(),
    warehouseList: z.array(WarehouseSchema),
});

export type BoxTariffs = z.infer<typeof BoxTariffsSchema>;
