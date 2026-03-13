import { z } from "zod";

export const optionalDate = () =>
    z.preprocess((val) => {
        if (val === "" || val === null) return undefined;

        if (typeof val === "string") {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(val)) {
                const [year, month, day] = val.split("-").map(Number);
                return new Date(Date.UTC(year, month - 1, day));
            }
        }

        return val;
    }, z.date().optional());
