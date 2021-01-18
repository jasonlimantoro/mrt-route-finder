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
import { RouteResponse, StationID, Route } from "./types";

@Service()
@Resolver(() => RouteResponse)
export class RouteResolver {
	constructor(private readonly routeService: RouteService) {}
	@Query(() => RouteResponse)
	async route(
		@Arg("source") source: StationID,
		@Arg("target") target: StationID,
		@Arg("startTime", { nullable: true }) startTime: string,
		@Ctx() ctx: MyContext
	): Promise<RouteResponse> {
		const allRoutes = this.routeService.recommendRoutes(
			ctx.mrt,
			source,
			target,
			startTime
		);
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
