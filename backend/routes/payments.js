import { Router } from "express";
import { confirmNetopiaPayment, initiateNetopiaPayment } from "../controllers/paymentsController.js";

const router = Router();

router.post("/netopia/initiate", initiateNetopiaPayment);
router.post("/netopia/confirm", confirmNetopiaPayment);

export default router;
