import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import "express-async-errors";
import { errorHandler } from "./lib/middleware";
import { ApolloServer } from "apollo-server-express";
import { createSchema } from "./lib/utils";
import { MRT } from "./modules/routes/map";
import { MyContext } from "./lib/context";

export const startServer = async () => {
	const app = express();
	app.use(morgan("common", { skip: () => process.env.NODE_ENV === "test" }));
	app.use(bodyParser.json());

	app.get("/", (_req, res) => res.send("Hello World!"));

	const mrtMap = new MRT();
	await mrtMap.init();
	// eslint-disable-next-line no-console
	console.log(
		"Loaded:",
		mrtMap.numNodes,
		"nodes",
		"and",
		mrtMap.numEdges,
		"edges"
	);

	const apolloServer = new ApolloServer({
		schema: await createSchema(),
		context: ({ req, res }): MyContext => ({ req, res, mrt: mrtMap }),
		playground: {
			settings: {
				"request.credentials": "include",
				"prettier.printWidth": "60",
			} as any,
		},
	});
	apolloServer.applyMiddleware({ app });

	app.use(errorHandler);

	return app;
};
