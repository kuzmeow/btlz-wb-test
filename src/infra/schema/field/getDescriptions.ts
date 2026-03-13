import { z } from "zod";

export function getFieldDescriptions<T extends z.ZodObject<any>>(schema: T): Record<string, string> {
    const descriptions: Record<string, string> = {};

    for (const [key, field] of Object.entries(schema.shape)) {
        const desc = (field as z.ZodTypeAny)._def?.description;
        if (desc) {
            descriptions[key] = desc;
        }
    }

    return descriptions;
}
