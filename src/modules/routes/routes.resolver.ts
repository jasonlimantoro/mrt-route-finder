import { Arg, Field, Int, ObjectType, Query, Resolver } from "type-graphql";
import { mrtMap } from "./map";
import { StationID } from "./types";
import { dijkstra2 } from "./utils";

@ObjectType()
class Route {
	@Field(() => [String!]!)
	instructions: string[];

	@Field(() => Int!)
	duration: number;
}

@ObjectType()
class RouteResponse {
	@Field(() => [Route!]!)
	alternativeRoutes: Route[];

	@Field(() => Route)
	topRoute: Route;
}

@Resolver()
export class RouteResolver {
	@Query(() => RouteResponse!)
	async route(
		@Arg("source") source: StationID,
		@Arg("target") target: StationID,
		@Arg("startTime", { nullable: true }) startTime: string
	): Promise<RouteResponse> {
		const { allPossiblePathsWithInstructions } = dijkstra2(
			mrtMap,
			source,
			target,
			startTime
		);
		return {
			alternativeRoutes: allPossiblePathsWithInstructions.slice(1),
			topRoute: allPossiblePathsWithInstructions[0],
		};
	}
}
