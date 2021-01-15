import { Arg, Query, Resolver } from "type-graphql";
import { mrtMap } from "./map";
import { RouteResponse, StationID } from "./types";
import { dijkstra2 } from "./utils";

@Resolver(() => RouteResponse)
export class RouteResolver {
	@Query(() => RouteResponse)
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
