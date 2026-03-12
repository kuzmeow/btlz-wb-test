import { tariffService } from "#modules/tariff/service.js";
import { wbApiService } from "#modules/wbApi/service.js";
import { migrate } from "#postgres/knex.js";

await migrate.latest();
// await seed.run();

console.log("All migrations and seeds have been run");

const date = new Date();
date.setDate(date.getDate() - 60);
const tariff = await wbApiService.getBoxTariffs(date);
await tariffService.process(tariff, date);
