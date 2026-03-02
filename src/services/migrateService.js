import { pool } from "../config/postgres.js";
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
