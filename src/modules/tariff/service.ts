import { warehouseService, WarehouseService } from "#modules/warehouse/service.js";
import { wbApiService, WbApiService } from "#modules/wbApi/service.js";
import { TariffEntity } from "./entity.js";
import { tariffRepository, TariffRepository } from "./repository.js";
import { Tariff } from "./schema.js";

export class TariffService {
    constructor(
        private readonly rep: TariffRepository,
        private readonly warehouseService: WarehouseService,
        private readonly wbApiService: WbApiService,
    ) {}

    async createWithWarehouses(data: Tariff, fetchDate: Date): Promise<TariffEntity> {
        const tariff = await this.rep.create(data, fetchDate);
        tariff.warehouses = await this.warehouseService.createForTariff(tariff.id, data.warehouseList);
        return tariff;
    }

    async createForDate(fetchDate: Date): Promise<TariffEntity> {
        const fetchedTariff = await this.wbApiService.getBoxTariff(fetchDate);
        return await this.createWithWarehouses(fetchedTariff, fetchDate);
    }

    async process(data: Tariff, fetchDate: Date): Promise<TariffEntity> {
        const existingTariff = await this.rep.getOneWithWarehouses({
            fetchDate: fetchDate,
        });
        if (!existingTariff) {
            console.log(`No existing tariff for ${fetchDate}. Creating new one...`);
            return await this.createWithWarehouses(data, fetchDate);
        }

        existingTariff.dtNextBox = data.dtNextBox;
        existingTariff.dtTillMax = data.dtTillMax;
        existingTariff.fetchDate = fetchDate;
        const updatedTariff = await this.rep.save(existingTariff);

        updatedTariff.warehouses = await this.warehouseService.processForTariff(
            updatedTariff.id,
            existingTariff.warehouses ?? [],
            data.warehouseList,
        );

        return updatedTariff;
    }

    async getOneById(tariffId: string): Promise<TariffEntity> {
        const tariff = await this.rep.getOneWithWarehouses({ id: tariffId });
        if (!tariff) throw new Error(`Tariff ${tariffId} not found`);
        return tariff;
    }

    async getOneByFetchDate(fetchDate: Date): Promise<TariffEntity> {
        const tariff = await this.rep.getOneWithWarehouses({ fetchDate });
        if (tariff) return tariff;

        return await this.createForDate(fetchDate);
    }

    async getOneAndUpdateByFetchDate(fetchDate?: Date): Promise<TariffEntity> {
        const date = fetchDate ? fetchDate : new Date();
        const fetchedTariff = await this.wbApiService.getBoxTariff(date);
        return await this.process(fetchedTariff, date);
    }
}

export const tariffService = new TariffService(tariffRepository, warehouseService, wbApiService);
