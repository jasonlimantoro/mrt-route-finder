import express from "express";

const router = express.Router();

router.get("/", async (_req: any, res) => {
	res.json({
		drafts: [],
	});
});

export default router;
