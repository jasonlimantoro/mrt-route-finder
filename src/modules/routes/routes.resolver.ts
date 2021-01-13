import { Arg, Query, Resolver } from "type-graphql";

@Resolver()
export class RouteResolver {
	@Query(() => String)
	async route(
		@Arg("source") _source: string,
		@Arg("target") _target: string,
		@Arg("startTime", { nullable: true }) _startTime: string
	) {
		return "route resolver";
	}
}
