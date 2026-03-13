import { SHEETS_TABLE_NAME } from "#modules/sheet/entity.js";
import { TARIFFS_TABLE_NAME } from "#modules/tariff/entity.js";

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.transaction(async (trx) => {
        await trx.schema.alterTable(SHEETS_TABLE_NAME, (table) => {
            table.uuid("tariff_id").nullable().references("id").inTable(TARIFFS_TABLE_NAME).onDelete("SET NULL");
            table.index("tariff_id");
        });

        const existingTariff = await trx(TARIFFS_TABLE_NAME).orderBy("fetch_date", "desc").first();
        const [tariff] = existingTariff
            ? [existingTariff]
            : await trx(TARIFFS_TABLE_NAME)
                  .insert({
                      dt_next_box: null,
                      dt_till_max: null,
                      fetch_date: trx.fn.now(),
                  })
                  .returning("*");

        await trx(SHEETS_TABLE_NAME).whereNull("tariff_id").update({ tariff_id: tariff.id });

        await trx.schema.alterTable(SHEETS_TABLE_NAME, (table) => {
            table.uuid("tariff_id").notNullable().alter();
        });

        await trx.schema.alterTable(SHEETS_TABLE_NAME, (table) => {
            table.dropForeign("tariff_id");
            table.foreign("tariff_id").references("id").inTable(TARIFFS_TABLE_NAME).onDelete("CASCADE");
        });
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.alterTable(SHEETS_TABLE_NAME, (table) => {
        table.dropForeign("tariff_id");
        table.dropColumn("tariff_id");
    });
}
