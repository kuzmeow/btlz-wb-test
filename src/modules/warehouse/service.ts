import { WarehouseEntity } from "./entity.js";
import { WarehouseRepository, warehouseRepository } from "./repository.js";
import { Warehouse } from "./schema.js";

export class WarehouseService {
    constructor(private readonly rep: WarehouseRepository) {}

    async createForTariff(tariffId: string, data: Warehouse[]): Promise<WarehouseEntity[]> {
        return await this.rep.createMany(tariffId, data);
    }

    async processForTariff(tariffId: string, warehouses: WarehouseEntity[], data: Warehouse[]) {
        const newWarehouses: WarehouseEntity[] = [];
        for (const item of data) {
            const warehouse = warehouses.find((w) => w.warehouseName === item.warehouseName);
            if (warehouse) {
                Object.assign(warehouse, item);
                newWarehouses.push(warehouse);
                continue;
            }
            newWarehouses.push(await this.rep.create(tariffId, item));
        }
        return await this.rep.saveMany(newWarehouses);
    }

    async getManyForTariff(tariffId: string): Promise<WarehouseEntity[]> {
        return await this.rep.getMany({ tariffId });
    }
}

export const warehouseService = new WarehouseService(warehouseRepository);
