import { warehouseService, WarehouseService } from "#modules/warehouse/service.js";
import { TariffEntity } from "./entity.js";
import { tariffRepository, TariffRepository } from "./repository.js";
import { Tariff } from "./schema.js";

export class TariffService {
    constructor(
        private readonly rep: TariffRepository,
        private readonly warehouseService: WarehouseService,
    ) {}

    async createWithWarehouses(data: Tariff, fetchDate: Date): Promise<TariffEntity> {
        const tariff = await this.rep.create(data, fetchDate);
        tariff.warehouses = await this.warehouseService.createForTariff(tariff.id, data.warehouseList);
        return tariff;
    }

    async process(data: Tariff, fetchDate: Date): Promise<TariffEntity> {
        const currentTariff = await this.rep.getOneWithWarehouses({
            lastFetchDate: fetchDate,
        });
        if (!currentTariff) return await this.createWithWarehouses(data, fetchDate);

        currentTariff.dtNextBox = data.dtNextBox;
        currentTariff.dtTillMax = data.dtTillMax;
        currentTariff.lastFetchDate = fetchDate;
        const updatedTariff = await this.rep.save(currentTariff);

        updatedTariff.warehouses = await this.warehouseService.processForTariff(
            updatedTariff.id,
            currentTariff.warehouses ?? [],
            data.warehouseList,
        );

        return updatedTariff;
    }

    async getOneById(tariffId: string): Promise<TariffEntity> {
        const tariff = await this.rep.getOneWithWarehouses({ id: tariffId });
        if (!tariff) throw new Error(`Tariff ${tariffId} not found`);
        return tariff;
    }
}

export const tariffService = new TariffService(tariffRepository, warehouseService);
