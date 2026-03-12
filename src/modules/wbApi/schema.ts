import { TariffSchema } from "#modules/tariff/schema.js";
import { z } from "zod";

export const WbBoxTariffsResponseSchema = z.object({
    response: z.object({
        data: TariffSchema,
    }),
});
