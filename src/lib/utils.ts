import { buildSchema } from "type-graphql";
import { Container } from "typedi";

export const createSchema = async () => {
	return buildSchema({
		resolvers: [__dirname + "/../modules/**/*.resolver.{js,ts}"],
		container: Container,
	});
};
