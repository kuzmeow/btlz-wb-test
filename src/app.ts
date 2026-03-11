import { wbApiService } from "#modules/wbApi/service.js";
import { migrate, seed } from "#postgres/knex.js";

await migrate.latest();
await seed.run();

console.log("All migrations and seeds have been run");

const data = await wbApiService.getYesterdayTariffs();
console.log({ ...data, warehouseList: data.warehouseList });
