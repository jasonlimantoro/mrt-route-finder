import { MRT } from "@app/modules/routes/map";
import { Request, Response } from "express";

export interface MyContext {
	req: Request;
	res: Response;
	mrt: MRT;
}
