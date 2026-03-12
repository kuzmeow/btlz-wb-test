import { z } from "zod";

export const BaseEntitySchema = z.object({
    id: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type BaseEntity = z.infer<typeof BaseEntitySchema>;
