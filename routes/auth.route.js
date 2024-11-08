import express from "express";
const router = express.Router();
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import verifyJWT from "../middlerwares/auth.middleware.js";

router.post("/register", registerUser);

router.post("/login", loginUser);
export default router;
