import { promises } from "fs";
import { pool } from "../config/postgres.js";
import { resolve } from "dns";
import { rejects } from "assert";
//import fs from "fs";
//import csv from "csv-parser";
//import { env } from "../config/env.js";

export async function queryTables() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // create table customer
    await client.query(`
      CREATE TABLE IF NOT EXISTS "customer" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"address" varchar(200) NOT NULL,
	"phone" varchar(15) NOT NULL,
	PRIMARY KEY("id")
);
`);

    // create table product
    await client.query(`
  CREATE TABLE IF NOT EXISTS "product" (
	"id" varchar(255) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"category" varchar(255) NOT NULL,
	"unit_price" decimal NOT NULL,
	"id_customer" int NOT NULL UNIQUE,
	PRIMARY KEY("id"),
  CONSTRAINT fk_customer_id FOREING KEY ("id_customer")
    REFERENCES "customer"("id")
    ON UPDATE NO ACTION ON DELETE NO ACTION
);
`);

    // create table supplier
    await client.query(`
  CREATE TABLE IF NOT EXISTS "supplier" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"id_product" varchar(255) NOT NULL UNIQUE,
	PRIMARY KEY("id")
  CONSTRAINT fk_product_id FOREING KEY ("id_product")
    REFERENCES "product"("id")
    ON UPDATE NO ACTION ON DELETE NO ACTION
);
`);

    // create table sale
    await client.query(`
CREATE TABLE IF NOT EXISTS "sale" (
	"id" varchar(255) NOT NULL UNIQUE,
	"date" date NOT NULL,
	"quantity" decimal NOT NULL,
	"total_line_value" decimal NOT NULL,
	"id_product" varchar(255) NOT NULL UNIQUE,
	PRIMARY KEY("id")
  CONSTRAINT fk_product_id FOREING KEY ("id_product")
    REFERENCES "product"("id")
    ON UPDATE NO ACTION ON DELETE NO ACTION
);
`);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

// Data inserction

export async function queryData() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(env.fileDataCsv)
        .pipe(csv())
        .on("data", (data) => result.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    const counters = {
      countSupplier : 0,
      counterProducts : 0,
    }

    for ( const row of result) {
      const customerName = row.customer_name.trim().replace(/\s+/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      const customerEmail = row.customer_email.trim().toLowerCase();
      const customerAddress = row.customer_address.trim();
      const customerPhone = row.customer_phone.trim();
      const productId = row.product_sku.trim().toUpperCase();
      const productName = row.product_name.trim();
      const productCategory = row.product_category.trim().toLowerCase();;
      const productUnitPrice = row.unit_price.trim();
      const saleId = row.transaction_id.trim().toUpperCase();
      const saleDate = row.date.trim();
      const saleQuantity = row.quantity.trim();
      const saleTotalLineValue = row.total_line_value.trim();
      const supplierName = row.supplier_name.trim().toLowerCase();
      const supplierEmail = row.supplier_email.trim().toLowerCase();

      const customerResult = await client.query(`
        INSERT INTO "customer" ("name" , "email", "address", "phone")
        VALUES ($1, $2, $3, $4) ON CONFLICT ("email")
        DO UPDATE SET
          name = EXCLUDED.name
        returning xmax
      `, [customerName, customerEmail, customerAddress,customerPhone])
      
      const customerId = await client.query(`
        SELECT id from customer where name = $1
      ` [customerName])
      
      const productResult = await client.query(`
        INSERT INTO "product" ("product_sku" , "name", "category", "unit_price")
        VALUES ($1, $2, $3, $4) ON CONFLICT ("product_sku")
        DO UPDATE SET
          name = EXCLUDED.name
        returning xmax
        `,[productId, productName, productCategory,productUnitPrice])

      const saleResult = await client.query(`
        INSERT INTO "sale" ("transaction_id" , "date", "quantity", "total_line_value")
        VALUES ($1, $2, $3, $4) ON CONFLICT ("transaction_id")
        DO UPDATE SET
          name = EXCLUDED.name
        returning xmax
        `,[saleId, saleDate, saleQuantity,saleTotalLineValue])


      const supplierResult = await client.query(`
        INSERT INTO "supplier" ("supplier_name" , "email")
        VALUES ($1, $2) ON CONFLICT ("email")
        DO UPDATE SET
          name = EXCLUDED.name
        returning xmax
        `,[supplierName, supplierEmail])
    }
  } catch (error) {
    console.log(error);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}
