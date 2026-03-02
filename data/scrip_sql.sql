CREATE TABLE IF NOT EXISTS "customer" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"address" varchar(200) NOT NULL,
	"phone" varchar(15) NOT NULL,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "product" (
	"id" varchar(255) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"category" varchar(255) NOT NULL,
	"unit_price" decimal NOT NULL,
	"id_customer" int NOT NULL UNIQUE,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "supplier" (
	"id" serial NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"id_product" varchar(255) NOT NULL UNIQUE,
	PRIMARY KEY("id")
);


CREATE TABLE IF NOT EXISTS "sale" (
	"id" varchar(255) NOT NULL UNIQUE,
	"date" date NOT NULL,
	"quantity" decimal NOT NULL,
	"total_line_value" decimal NOT NULL,
	"id_product" varchar(255) NOT NULL UNIQUE,
	PRIMARY KEY("id")
);


ALTER TABLE "product"
ADD FOREIGN KEY("id_customer") REFERENCES "customer"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "sale"
ADD FOREIGN KEY("id_product") REFERENCES "product"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "supplier"
ADD FOREIGN KEY("id_product") REFERENCES "product"("id")
ON UPDATE NO ACTION ON DELETE NO ACTION;