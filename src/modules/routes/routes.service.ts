import { dijkstra, yenAlgorithm } from "@app/lib/algorithm";
import { Service } from "typedi";
import { InstructionLine } from "./line";
import { MRT } from "./map";
import { Route, StationID } from "./types";
import { addMinutes } from "./utils";

@Service()
export class RouteService {
	recommendRoutes(
		mrt: MRT,
		source: StationID,
		target: StationID,
		startTime: string
	) {
		const ksp = yenAlgorithm(mrt, source, target, 5, { startTime }, dijkstra);
		const allRoutes: Route[] = [];
		for (const sp of ksp) {
			allRoutes.push({
				instructions: sp.edges.map((lq) =>
					new InstructionLine(lq).getInstruction()
				),
				durationMinute: sp.cost,
				numberOfStops: sp.path.length - 1,
				stops: sp.path,
				arrivalTime: startTime
					? addMinutes(new Date(startTime), sp.cost).toLocaleTimeString()
					: undefined,
			});
		}
		return allRoutes;
	}
}
