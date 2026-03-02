import express from "express";
import migrateRouter from "./routes/migrate.js";


export const app = express();

app.use(express.json())

app.use('/api/simulacro', migrateRouter )
