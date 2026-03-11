import { BoxTariffsSchema } from "#modules/boxTariffs/schema.js";
import { z } from "zod";

export const WbBoxTariffsResponseSchema = z.object({
    response: z.object({
        data: BoxTariffsSchema,
    }),
});
