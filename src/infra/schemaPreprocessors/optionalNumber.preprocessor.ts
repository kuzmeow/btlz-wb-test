import { z } from "zod";

export const optionalNumber = () =>
    z.preprocess((val) => {
        if (val === "-") return undefined;

        if (typeof val === "string") {
            const num = parseFloat(val.replace(",", "."));
            return isNaN(num) ? undefined : num;
        }

        return val;
    }, z.number().optional());
