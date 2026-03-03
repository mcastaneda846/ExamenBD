import { env } from "../config/env.js";

import pg from 'pg';

import { queryData, queryTables } from "../services/migrateService.js";

const { Pool } = pg;

export const pool = new Pool({
    connectionString: env.postgresUri

});

async function createTables() {
   try {
    await queryTables()
    console.log("Tablas creadas con éxito")
   } catch (error) {
    console.error(error);
   }
}

async function migrateData() {
    try {
        return await queryData()
    } catch (error) {
        console.error(error);
    }
}

(async () => {
    await createTables();
    await migrateData();
})();

export { createTables, migrateData }