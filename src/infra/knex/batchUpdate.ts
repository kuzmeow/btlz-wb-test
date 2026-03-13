import { Knex } from "knex";

interface BatchUpdateConfig {
    tableName: string;
    data: Record<string, any>[];
    idField: string;
    pgTypes: Record<string, string>;
    updateFields?: string[];
    excludeFields?: string[];
}

export async function batchUpdate(trx: Knex.Transaction, config: BatchUpdateConfig): Promise<any[]> {
    const { tableName, data, idField, pgTypes, updateFields, excludeFields = [] } = config;

    if (data.length === 0) return [];

    const fieldsToUpdate =
        updateFields ?? Object.keys(pgTypes).filter((key) => ![idField, "created_at", "updated_at"].includes(key));
    const filteredFields = fieldsToUpdate.filter((f) => !excludeFields.includes(f));
    const ids = data.map((item) => item[idField]);
    const fieldArrays = filteredFields.map((field) => data.map((item) => item[field]));
    const setClause = filteredFields.map((field) => `${field} = u.${field}`).join(",\n            ");
    const unnestColumns = filteredFields.map((field) => `?::${pgTypes[field] || "text"}[]`).join(",\n                ");
    const unnestAliases = filteredFields.join(", ");

    const sql = `
        UPDATE ${tableName} w
        SET
            ${setClause},
            updated_at = NOW()
        FROM (
            SELECT * FROM UNNEST(
                ?::${pgTypes[idField] || "uuid"}[],
                ${unnestColumns}
            ) AS t(${idField}, ${unnestAliases})
        ) u
        WHERE w.${idField} = u.${idField}
        RETURNING w.*
        `;

    const result = await trx.raw(sql, [ids, ...fieldArrays]);

    return result.rows;
}
