import { z } from "zod";

export const nullableNumber = () =>
    z.preprocess((val) => {
        if (val === "-" || val === undefined) return null;

        if (typeof val === "string") {
            const num = parseFloat(val.replace(",", "."));
            return isNaN(num) ? null : num;
        }

        return val;
    }, z.number().nullable());
