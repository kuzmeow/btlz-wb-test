import { optionalNumber } from "#infra/schemaPreprocessors/optionalNumber.preprocessor.js";
import { z } from "zod";

export const WarehouseSchema = z.object({
    boxDeliveryBase: optionalNumber(),
    boxDeliveryCoefExpr: optionalNumber(),
    boxDeliveryLiter: optionalNumber(),
    boxDeliveryMarketplaceBase: optionalNumber(),
    boxDeliveryMarketplaceCoefExpr: optionalNumber(),
    boxDeliveryMarketplaceLiter: optionalNumber(),
    boxStorageBase: optionalNumber(),
    boxStorageCoefExpr: optionalNumber(),
    boxStorageLiter: optionalNumber(),
    geoName: z.string(),
    warehouseName: z.string(),
});

export type Warehouse = z.infer<typeof WarehouseSchema>;
