import { z } from "zod";

export const BaseEntitySchema = z.object({
    id: z.string().uuid().describe("id записи"),
    createdAt: z.date().describe("Время создания"),
    updatedAt: z.date().describe("Обновлено"),
});

export type BaseEntity = z.infer<typeof BaseEntitySchema>;
