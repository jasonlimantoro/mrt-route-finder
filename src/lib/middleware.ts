import { NextFunction, Request, Response } from "express";

const errorHandler = (
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction
) => {
	// eslint-disable-next-line no-console
	console.error(err);
	if (typeof err === "string") {
		// custom application error
		return res.status(400).json({ message: err });
	}

	if (err.name === "ValidationError") {
		// mongoose validation error
		return res.status(400).json({ message: err.message });
	}

	if (err.name === "UnauthorizedError") {
		// jwt authentication error
		if (err.inner.name === "TokenExpiredError") {
			return res
				.status(401)
				.json({ message: "Token expired", code: "token_expired" });
		}
		return res.status(401).json({ message: err.message, code: err.code });
	}

	// default to 500 server error
	return res.status(500).json({ message: err.message });
};

export { errorHandler };
