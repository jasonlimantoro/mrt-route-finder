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
import { Service } from "typedi";
import { RouteService } from "./routes.service";
import { RouteResponseSuccess, StationID, Route, RouteResponse } from "./types";

@Service()
@Resolver(() => RouteResponseSuccess)
export class RouteResolver {
	constructor(private readonly routeService: RouteService) {}
	@Query(() => RouteResponse)
	async route(
		@Arg("source", () => String) source: StationID,
		@Arg("target", () => String) target: StationID,
		@Arg("startTime", () => String, { nullable: true }) startTime: string,
		@Ctx() ctx: MyContext
	): Promise<typeof RouteResponse> {
		if (!ctx.mrt.routes[source] || !ctx.mrt.routes[target]) {
			return {
				message: "Destination or Source is not a valid station",
			};
		}
		const allRoutes = this.routeService.recommendRoutes(
			ctx.mrt,
			source,
			target,
			startTime
		);
		if (allRoutes.length === 0) {
			return {
				message: `No path found from ${source} to ${target}`,
			};
		}
		return {
			allRoutes,
		};
	}
	@FieldResolver(() => Route, { nullable: true })
	topRoute(@Root() routeResponse: RouteResponseSuccess) {
		return routeResponse.allRoutes[0];
	}

	@FieldResolver(() => [Route], { nullable: true })
	alternativeRoutes(
		@Root() routeResponse: RouteResponseSuccess,
		@Arg("take", () => Int, { defaultValue: 2 }) take: number
	) {
		return routeResponse.allRoutes.slice(1, take + 1);
	}
}
