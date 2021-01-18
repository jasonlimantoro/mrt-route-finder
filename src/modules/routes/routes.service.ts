import { Service } from "typedi";
import { MRT } from "./map";
import { StationID } from "./types";
import { ksp } from "./utils";

@Service()
export class RouteService {
	recommendRoutes(
		mrt: MRT,
		source: StationID,
		target: StationID,
		startTime: string
	) {
		const res = ksp(mrt, source, target, 5, { startTime });
		return res;
	}
}
