import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import "express-async-errors";
import { errorHandler } from "./lib/middleware";
import { ApolloServer } from "apollo-server-express";
import { createSchema } from "./lib/utils";

export const startServer = async () => {
	const app = express();
	app.use(morgan("common"));
	app.use(bodyParser.json());

	app.get("/", (_req, res) => res.send("Hello World!"));

	app.use(require("./routes").default);

	const apolloServer = new ApolloServer({
		schema: await createSchema(),
		context: ({ req, res }) => ({ req, res }),
		playground: {
			settings: {
				"request.credentials": "include",
			},
		},
	});
	apolloServer.applyMiddleware({ app });

	app.use(errorHandler);

	return app;
};
