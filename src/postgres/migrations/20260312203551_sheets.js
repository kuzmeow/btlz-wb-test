import { SHEETS_TABLE_NAME } from "#modules/sheet/entity.js";

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema.createTable(SHEETS_TABLE_NAME, (table) => {
        table.string("spreadsheet_id").primary();

        table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

        table.date("tariff_date").nullable();

        table.index("tariff_date");
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.dropTable(SHEETS_TABLE_NAME);
}
