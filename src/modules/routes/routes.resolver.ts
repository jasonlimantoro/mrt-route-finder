import { Arg, Field, Int, ObjectType, Query, Resolver } from "type-graphql";
import { mrtMap } from "./map";
import { StationID } from "./types";
import { dijksta } from "./utils";

@ObjectType()
class RouteResponse {
	@Field(() => [String!]!)
	paths: string[];

	@Field(() => Int!)
	duration: number;
}

@Resolver()
export class RouteResolver {
	@Query(() => RouteResponse!)
	async route(
		@Arg("source") source: StationID,
		@Arg("target") target: StationID,
		@Arg("startTime", { nullable: true }) startTime: string
	): Promise<RouteResponse> {
		const { paths, duration } = dijksta(mrtMap, source, target, startTime);
		return {
			paths,
			duration,
		};
	}
}
