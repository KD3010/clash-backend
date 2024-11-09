import { Router } from "express";
import { AuthControllers } from "../controllers";
import { AuthMiddleware } from "../middleware";

export const router = Router();

router.post("/register", AuthControllers.register);
router.get("/verify-email", AuthControllers.verifyEmail);
router.post("/login", AuthControllers.login)
router.post("/verify-login-credentials", AuthControllers.verifyLoginCredentials)
router.post("/logout", AuthMiddleware.isAuthorized, AuthControllers.logout)

export default router;