import { Router } from "express";
import { AuthControllers } from "../controllers";

export const router = Router();

router.post("/register", AuthControllers.register);
router.get("/verify-email", AuthControllers.verifyEmail);
router.post("/login", AuthControllers.login)


export default router;