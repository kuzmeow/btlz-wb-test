import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.union([z.undefined(), z.enum(["development", "production"])]),
    POSTGRES_HOST: z.union([z.undefined(), z.string()]),
    POSTGRES_PORT: z
        .string()
        .regex(/^[0-9]+$/)
        .transform((value) => parseInt(value)),
    POSTGRES_DB: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    APP_PORT: z.union([
        z.undefined(),
        z
            .string()
            .regex(/^[0-9]+$/)
            .transform((value) => parseInt(value)),
    ]),

    WB_BASE_URL: z.union([z.undefined(), z.string()]),
    WB_API_KEY: z.string(),

    SHEET_NAME: z.string(),

    CRON_UPDATE_TARIFFS: z.string(),
});

const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
export default env;
