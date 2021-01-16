import { Arg, FieldResolver, Int, Query, Resolver, Root } from "type-graphql";
import { mrtMap } from "./map";
import { RouteResponse, StationID, Route } from "./types";
import { dijkstra2 } from "./utils";

@Resolver(() => RouteResponse)
export class RouteResolver {
	@Query(() => RouteResponse)
	async route(
		@Arg("source") source: StationID,
		@Arg("target") target: StationID,
		@Arg("startTime", { nullable: true }) startTime: string
	): Promise<RouteResponse> {
		const allRoutes = dijkstra2(mrtMap, source, target, startTime);
		return {
			allRoutes,
		};
	}
	@FieldResolver(() => Route, { nullable: true })
	topRoute(@Root() routeResponse: RouteResponse) {
		return routeResponse.allRoutes[0];
	}

	@FieldResolver(() => [Route], { nullable: true })
	alternativeRoutes(
		@Root() routeResponse: RouteResponse,
		@Arg("take", () => Int, { defaultValue: 2 }) take: number
	) {
		return routeResponse.allRoutes.slice(1, take + 1);
	}
}
