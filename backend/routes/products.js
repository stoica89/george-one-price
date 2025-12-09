import { Router } from "express";
import { listProducts, createProduct } from "../controllers/productsController.js";

const router = Router();

router.get("/", listProducts);
router.post("/", createProduct);

export default router;
