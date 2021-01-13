import { parse } from "@app/data/dataParser";
import { Line, LineFactory } from "./line";
import { Station, StationFactory } from "./station";
import { MrtMap, StationID, StationType } from "./types";
import { stationCodeToLineType } from "./utils";

const createStations = async () => {
	const data = await parse();
	return Object.values(data).reduce<{ [key: string]: Station }>(
		(accum, current) => {
			const {
				"Station Code": stationCode,
				"Station Name": stationName,
				"Opening Date": openingDate,
			} = current;
			const stationType = stationCode.substr(0, 2) as StationType;
			return {
				...accum,
				[stationCode]: StationFactory.create(stationType, stationCode, {
					id: stationCode as StationID,
					name: stationName,
					line: stationType,
					openingDate,
				}),
			};
		},
		{}
	);
};

export const mrtMap: MrtMap = {
	routes: {
		EW33: ["EW33-EW32"],
		EW32: ["EW33-EW32", "EW32-EW31"],
		EW31: ["EW32-EW31", "EW31-EW30"],
		EW30: ["EW31-EW30", "EW30-EW29"],
		EW29: ["EW30-EW29", "EW29-EW28"],
		EW28: ["EW29-EW28", "EW28-EW27"],
		EW27: ["EW28-EW27", "EW27-EW26"],
		EW26: ["EW27-EW26", "EW26-EW25"],
		EW25: ["EW26-EW25", "EW25-EW24"],
		EW24: ["EW25-EW24", "EW24-EW23", "NS1-EW24"],
		EW23: ["EW24-EW23", "EW23-EW22"],
		EW22: ["EW23-EW22", "EW22-EW21"],
		EW21: ["EW22-EW21", "EW21-EW20"],
		EW20: ["EW21-EW20", "EW20-EW19"],
		EW19: ["EW20-EW19", "EW19-EW18"],
		EW18: ["EW19-EW18", "EW18-EW17"],
		EW17: ["EW18-EW17", "EW17-EW16"],
		EW16: ["EW17-EW16", "EW16-EW15"],
		EW15: ["EW16-EW15", "EW15-EW14"],
		EW14: ["EW15-EW14", "EW14-EW13"],
		EW13: ["EW14-EW13", "EW13-EW12"],
		EW12: ["EW13-EW12", "EW12-EW11"],
		EW11: ["EW12-EW11", "EW11-EW10"],
		EW10: ["EW11-EW10", "EW10-EW9"],
		EW9: ["EW10-EW9", "EW9-EW8"],
		EW8: ["EW9-EW8", "EW8-EW7"],
		EW7: ["EW8-EW7", "EW7-EW6"],
		EW6: ["EW7-EW6", "EW6-EW5"],
		EW5: ["EW6-EW5", "EW5-EW4"],
		EW4: ["EW5-EW4", "EW4-EW3", "EW4-CG0"],
		EW3: ["EW4-EW3", "EW3-EW2"],
		EW2: ["EW3-EW2", "EW2-EW1"],
		EW1: ["EW2-EW1"],
		CG2: ["CG2-CG1"],
		CG1: ["CG1-CG0", "CG0-DT5"],
		CG0: ["CG1-CG0", "CG0-EW4"],
		NS28: ["NS28-NS27"],
		NS27: ["NS28-NS27", "NS27-NS26"],
		NS26: ["NS27-NS26", "NS26-NS25"],
		NS25: ["NS26-NS25", "NS25-NS24"],
		NS24: ["NS25-NS24", "NS24-NS23"],
		NS23: ["NS24-NS23", "NS23-NS22"],
		NS22: ["NS23-NS22", "NS22-NS21"],
		NS21: ["NS22-NS21", "NS21-NS20"],
		NS20: ["NS21-NS20", "NS20-NS19"],
		NS19: ["NS20-NS19", "NS19-NS18"],
		NS18: ["NS19-NS18", "NS18-NS17"],
		NS17: ["NS18-NS17", "NS17-NS16"],
		NS16: ["NS17-NS16", "NS16-NS15"],
		NS15: ["NS16-NS15", "NS15-NS14"],
		NS14: ["NS15-NS14", "NS14-NS13"],
		NS13: ["NS14-NS13", "NS13-NS12"],
		NS12: ["NS13-NS12", "NS12-NS11"],
		NS11: ["NS12-NS11", "NS11-NS10"],
		NS10: ["NS11-NS10", "NS10-NS9"],
		NS9: ["NS10-NS9", "NS9-NS8"],
		NS8: ["NS9-NS8", "NS8-NS7"],
		NS7: ["NS8-NS7", "NS7-NS5"],
		NS5: ["NS7-NS5", "NS5-NS4"],
		NS4: ["NS5-NS4", "NS4-NS3"],
		NS3: ["NS4-NS3", "NS3-NS2"],
		NS2: ["NS3-NS2", "NS2-NS1"],
		NS1: ["NS2-NS1", "NS1-EW24"],
	},
	entities: {
		stations: {},
		lines: {},
	},
};

(async () => {
	const stations = await createStations();
	const lines: { [key: string]: Line } = {};
	for (const station of Object.keys(mrtMap.routes)) {
		const connections = mrtMap.routes[station as StationID] || [];
		const stationType = stationCodeToLineType(station);
		for (const lineId of connections) {
			const [src, target] = lineId.split("-");
			const line = LineFactory.create(
				stationType,
				lineId,
				src as StationID,
				target as StationID
			);
			lines[lineId] = line;
		}
	}
	mrtMap.entities.lines = lines;
	mrtMap.entities.stations = stations;
})();
