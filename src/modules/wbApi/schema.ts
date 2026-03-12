import { TariffsSchema } from "#modules/tariffs/schema.js";
import { z } from "zod";

export const WbBoxTariffsResponseSchema = z.object({
    response: z.object({
        data: TariffsSchema,
    }),
});
