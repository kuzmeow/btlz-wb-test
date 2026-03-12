import { WAREHOUSES_TABLE_NAME } from "#modules/warehouse/entity.js";

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema.createTable(WAREHOUSES_TABLE_NAME, (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

        table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

        table.decimal("box_delivery_base", 10, 2).nullable();
        table.decimal("box_delivery_coef_expr", 10, 2).nullable();
        table.decimal("box_delivery_liter", 10, 2).nullable();
        table.decimal("box_delivery_marketplace_base", 10, 2).nullable();
        table.decimal("box_delivery_marketplace_coef_expr", 10, 2).nullable();
        table.decimal("box_delivery_marketplace_liter", 10, 2).nullable();
        table.decimal("box_storage_base", 10, 2).nullable();
        table.decimal("box_storage_coef_expr", 10, 2).nullable();
        table.decimal("box_storage_liter", 10, 2).nullable();
        table.string("geo_name").notNullable();
        table.string("warehouse_name").notNullable();

        table.index("warehouse_name");
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.dropTable(WAREHOUSES_TABLE_NAME);
}
