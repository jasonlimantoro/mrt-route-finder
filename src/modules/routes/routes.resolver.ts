import { MyContext } from "@app/lib/context";
import {
	Arg,
	Ctx,
	FieldResolver,
	Int,
	Query,
	Resolver,
	Root,
} from "type-graphql";
import { RouteResponse, StationID, Route } from "./types";
import { dijkstra2, ksp } from "./utils";

@Resolver(() => RouteResponse)
export class RouteResolver {
	@Query(() => RouteResponse)
	async route(
		@Arg("source") source: StationID,
		@Arg("target") target: StationID,
		@Arg("startTime", { nullable: true }) startTime: string,
		@Ctx() ctx: MyContext
	): Promise<RouteResponse> {
		let allRoutes: Route[] = [];
		if (startTime) {
			allRoutes = dijkstra2(ctx.mrt, source, target, startTime);
		} else {
			allRoutes = ksp(ctx.mrt, source, target, 5);
		}
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
