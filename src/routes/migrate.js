import { Router } from "express";
import { migrateData } from "../config/postgres.js";

const router = Router();

router.post("/migrate", async (req, res) => {
  try {
    const counters = await migrateData();
    return res.status(200).json({
      message: "Migration completed successfully",
      counters,
    });
  } catch (error) {
    console.error("Error en la ruta /migrate:", error);
    return res.status(500).json({
      message: "Migration failed",
      error: error.message,
    });
  }
});

export default router;
