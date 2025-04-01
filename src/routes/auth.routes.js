import { Router } from "express";
import { login, register, requestPasswordReset, resetPassword, verifyToken, logout, requestContactForm, registerSubsRequest } from "../controllers/auth.controller.js";


const router = Router();

router.post('/login', login);
router.post("/register", register);
router.get("/verify", verifyToken);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);
router.post("/contactform", requestContactForm);
router.post("/register-subs", registerSubsRequest);

router.post("/logout", logout);


export default router;
