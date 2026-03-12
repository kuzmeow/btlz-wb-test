import { Tariffs } from "#modules/tariffs/schema.js";
import { WarehouseEntity } from "./entity.js";
import { WarehouseRepository, warehouseRepository } from "./repository.js";

class WarehouseService {
    constructor(private readonly rep: WarehouseRepository) {}

    async createFromTariffs(tariffs: Tariffs): Promise<WarehouseEntity[]> {
        return await this.rep.createMany(tariffs.warehouseList);
    }
}

export const warehouseService = new WarehouseService(warehouseRepository);
