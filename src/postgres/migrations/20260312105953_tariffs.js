import { TARIFFS_TABLE_NAME } from "#modules/tariff/entity.js";

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema.createTable(TARIFFS_TABLE_NAME, (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

        table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

        table.date("dt_next_box").nullable();
        table.date("dt_till_max").nullable();

        table.date("fetch_date");

        table.index("fetch_date");
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.dropTable(TARIFFS_TABLE_NAME);
}
