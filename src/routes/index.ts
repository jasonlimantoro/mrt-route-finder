import express from "express";
import draft from "./draft";

const router = express.Router();

router.use("/drafts", draft);

export default router;
