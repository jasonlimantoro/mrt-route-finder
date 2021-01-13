import { buildSchema } from "type-graphql";

export const createSchema = async () => {
	return buildSchema({
		resolvers: [__dirname + "/../modules/**/*.resolver.{js,ts}"],
	});
};
