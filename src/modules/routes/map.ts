import { parse } from "@app/data/dataParser";
import { Line, LineFactory } from "./line";
import { Station, StationFactory } from "./station";
import { MrtMap, StationID, StationType } from "./types";
import { constructLineId, stationCodeToLineType } from "./utils";

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
					openingDate: new Date(openingDate),
				}),
			};
		},
		{}
	);
};

export const mrtMap: MrtMap = {
	routes: {
		EW33: ["EW32"],
		EW32: ["EW33", "EW31"],
		EW31: ["EW32", "EW30"],
		EW30: ["EW31", "EW29"],
		EW29: ["EW30", "EW28"],
		EW28: ["EW29", "EW27"],
		EW27: ["EW28", "EW26"],
		EW26: ["EW27", "EW25"],
		EW25: ["EW26", "EW24"],
		EW24: ["EW25", "EW23", "NS1"],
		EW23: ["EW24", "EW22"],
		EW22: ["EW23", "EW21"],
		EW21: ["EW22", "EW20", "CC22"],
		EW20: ["EW21", "EW19"],
		EW19: ["EW20", "EW18"],
		EW18: ["EW19", "EW17"],
		EW17: ["EW18", "EW16"],
		EW16: ["EW17", "EW15"],
		EW15: ["EW16", "EW14"],
		EW14: ["EW15", "EW13", "NS26"],
		EW13: ["EW14", "EW12", "NS25"],
		EW12: ["EW13", "EW11"],
		EW11: ["EW12", "EW10"],
		EW10: ["EW11", "EW9"],
		EW9: ["EW10", "EW8"],
		EW8: ["EW9", "EW7", "CC9"],
		EW7: ["EW8", "EW6"],
		EW6: ["EW7", "EW5"],
		EW5: ["EW6", "EW4"],
		EW4: ["EW5", "EW3", "CG0"],
		EW3: ["EW4", "EW2"],
		EW2: ["EW3", "EW1"],
		EW1: ["EW2"],
		CG2: ["CG1"],
		CG1: ["CG0", "DT35", "DT34"],
		CG0: ["CG1", "EW4"],
		NS28: ["NS27", "CE2"],
		NS27: ["NS28", "NS26", "CE2"],
		NS26: ["NS27", "NS25", "EW14"],
		NS25: ["NS26", "NS24", "EW13"],
		NS24: ["NS25", "NS23"],
		NS23: ["NS24", "NS22"],
		NS22: ["NS23", "NS21"],
		NS21: ["NS22", "NS20"],
		NS20: ["NS21", "NS19"],
		NS19: ["NS20", "NS18"],
		NS18: ["NS19", "NS17"],
		NS17: ["NS18", "NS16", "CC15"],
		NS16: ["NS17", "NS15"],
		NS15: ["NS16", "NS14"],
		NS14: ["NS15", "NS13"],
		NS13: ["NS14", "NS12"],
		NS12: ["NS13", "NS11"],
		NS11: ["NS12", "NS10"],
		NS10: ["NS11", "NS9"],
		NS9: ["NS10", "NS8"],
		NS8: ["NS9", "NS7"],
		NS7: ["NS8", "NS5"],
		NS5: ["NS7", "NS4"],
		NS4: ["NS5", "NS3"],
		NS3: ["NS4", "NS2"],
		NS2: ["NS3", "NS1"],
		NS1: ["NS2", "EW24"],
		CE1: ["CE2", "DT16", "CC4"],
		CE2: ["CE1", "NS28"],
		CC1: ["NS24", "NE6", "CC2"],
		CC2: ["CC3", "CC1"],
		CC3: ["CC4", "CC2"],
		CC4: ["CC5", "CC3"],
		CC5: ["CC6", "CC4"],
		CC6: ["CC7", "CC5"],
		CC7: ["CC8", "CC6"],
		CC8: ["CC9", "CC7"],
		CC9: ["CC10", "CC8", "EW8"],
		CC10: ["CC11", "CC9", "DT26"],
		CC11: ["CC12", "CC10"],
		CC12: ["CC13", "CC11"],
		CC13: ["CC14", "CC12", "NE12"],
		CC14: ["CC15", "CC13"],
		CC15: ["CC16", "CC14", "NS17"],
		CC16: ["CC17", "CC15"],
		CC17: ["CC19", "CC16"],
		CC19: ["CC20", "CC17", "DT9"],
		CC20: ["CC21", "CC19"],
		CC21: ["CC22", "CC20"],
		CC22: ["CC23", "CC21", "EW21"],
		CC23: ["CC24", "CC22"],
		CC24: ["CC25", "CC23"],
		CC25: ["CC26", "CC24"],
		CC26: ["CC27", "CC25"],
		CC27: ["CC28", "CC26"],
		CC28: ["CC29", "CC27"],
		CC29: ["CC28", "NE1"],
	},
	entities: {
		stations: {},
		lines: {},
	},
};

(async () => {
	const stations = await createStations();
	const lines: { [key: string]: Line } = {};
	for (const sourceId of Object.keys(mrtMap.routes)) {
		const targetIds = mrtMap.routes[sourceId as StationID] || [];
		const stationType = stationCodeToLineType(sourceId);
		for (const targetId of targetIds) {
			const lineId = constructLineId(sourceId, targetId);
			const line = LineFactory.create(
				stationType,
				lineId,
				stations[sourceId],
				stations[targetId]
			);
			lines[lineId] = line;
		}
	}
	mrtMap.entities.lines = lines;
	mrtMap.entities.stations = stations;
})();
