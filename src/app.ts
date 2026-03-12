import { warehouseService } from "#modules/warehouse/service.js";
import { wbApiService } from "#modules/wbApi/service.js";
import { migrate, seed } from "#postgres/knex.js";

await migrate.latest();
// await seed.run();

console.log("All migrations and seeds have been run");

const date = new Date();
date.setDate(date.getDate() - 0);
const tariffs = await wbApiService.getBoxTariffs(date);
// console.log(data.warehouseList.length);
console.log({ ...tariffs, warehouseList: undefined });
const warehouses = await warehouseService.createFromTariffs(tariffs);
console.log(warehouses);
