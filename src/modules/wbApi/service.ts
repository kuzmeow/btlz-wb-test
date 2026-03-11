import env from "#config/env/env.js";
import { z } from "zod";
import { WbBoxTariffsResponseSchema } from "./schema.js";
import { BoxTariffs } from "#modules/boxTariffs/schema.js";

class WbApiService {
    constructor(
        private readonly apiKey: string,
        private readonly baseUrl: string,
    ) {}

    async getBoxTariffs(date: Date): Promise<BoxTariffs> {
        const url = new URL(`${this.baseUrl}/api/v1/tariffs/box`);
        url.searchParams.append("date", this.formatDate(date));

        const response = await fetch(url.toString(), {
            headers: { "Authorization": this.apiKey, "Content-Type": "application/json" },
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`WB API ошибка ${response.status}: ${errorText}`);
        }

        const rawData = await response.json();

        try {
            const validatedData = WbBoxTariffsResponseSchema.parse(rawData);
            return validatedData.response.data;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const issues = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
                throw new Error(`Невалидный ответ от WB API: ${issues}`);
            }
            throw error;
        }
    }

    async getYesterdayTariffs(): Promise<BoxTariffs> {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return this.getBoxTariffs(yesterday);
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
}

export const wbApiService = new WbApiService(env.WB_API_KEY, env.WB_BASE_URL ?? "https://common-api.wildberries.ru");
