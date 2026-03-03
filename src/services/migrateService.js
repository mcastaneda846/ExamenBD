import fs from "fs";
import csv from "csv-parser";
import { pool } from "../config/postgres.js";
import { env } from "../config/env.js";

export async function queryTables() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS "customer" (
        "id" serial PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL UNIQUE,
        "address" varchar(200) NOT NULL,
        "phone" varchar(15) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "product" (
        "id" varchar(255) PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "category" varchar(255) NOT NULL,
        "unit_price" decimal NOT NULL,
        "id_customer" int REFERENCES "customer"("id")
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "supplier" (
        "id" serial PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL UNIQUE,
        "id_product" varchar(255) REFERENCES "product"("id")
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "sale" (
        "id" varchar(255) PRIMARY KEY,
        "date" date NOT NULL,
        "quantity" decimal NOT NULL,
        "total_line_value" decimal NOT NULL,
        "id_product" varchar(255) REFERENCES "product"("id")
      );
    `);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("ERROR CREANDO TABLAS:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

export async function queryData() {
  const client = await pool.connect();
  try {
    const results = [];
    // Procesar CSV
    await new Promise((res, rej) => {
      fs.createReadStream(env.fileDataCsv)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", res)
        .on("error", rej);
    });

    await client.query("BEGIN");

    for (const row of results) {
      // Limpieza de datos (igual que tu lógica)
      const customerEmail = row.customer_email.trim().toLowerCase();
      
      // 1. Insertar Cliente y obtener ID real
      const custRes = await client.query(`
        INSERT INTO "customer" ("name", "email", "address", "phone")
        VALUES ($1, $2, $3, $4) 
        ON CONFLICT ("email") DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `, [row.customer_name, customerEmail, row.customer_address, row.customer_phone]);
      
      const customerId = custRes.rows[0].id;

      // 2. Insertar Producto (Usando el ID de cliente obtenido)
      await client.query(`
        INSERT INTO "product" ("id", "name", "category", "unit_price", "id_customer")
        VALUES ($1, $2, $3, $4, $5) 
        ON CONFLICT ("id") DO UPDATE SET name = EXCLUDED.name
      `, [row.product_sku, row.product_name, row.product_category, row.unit_price, customerId]);

      // 3. Insertar Venta
      await client.query(`
        INSERT INTO "sale" ("id", "date", "quantity", "total_line_value", "id_product")
        VALUES ($1, $2, $3, $4, $5) 
        ON CONFLICT ("id") DO NOTHING
      `, [row.transaction_id, row.date, row.quantity, row.total_line_value, row.product_sku]);
    }

    await client.query("COMMIT");
    console.log("Migración completada");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("ERROR INSERTANDO DATOS:", error);
  } finally {
    client.release();
  }
}