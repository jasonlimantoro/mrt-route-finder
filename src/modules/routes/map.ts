import { parse } from "@app/data/dataParser";
import { Graph } from "@app/lib/graph";
import { Line, LineFactory, LineQuery } from "./line";
import { Station, StationFactory } from "./station";
import { Mapping, MrtMap, StationID, StationType } from "./types";
import { constructLineId, stationCodeToLineType } from "./utils";

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
		EW16: ["EW17", "EW15", "NE3"],
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
		EW2: ["EW3", "EW1", "DT32"],
		EW1: ["EW2"],
		CG2: ["CG1"],
		CG1: ["CG2", "CG0", "DT35"],
		CG0: ["CG1", "EW4"],
		NS28: ["NS27"],
		NS27: ["NS28", "NS26", "CE2"],
		NS26: ["NS27", "NS25", "EW14"],
		NS25: ["NS26", "NS24", "EW13"],
		NS24: ["NS25", "NS23", "NE6", "CC1"],
		NS23: ["NS24", "NS22"],
		NS22: ["NS23", "NS21"],
		NS21: ["NS22", "NS20", "DT11"],
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
		CE0: ["CC4"],
		CE1: ["CE2", "DT16", "CC4"],
		CE2: ["CE1", "NS28"],
		CC1: ["NS24", "NE6", "CC2"],
		CC2: ["CC3", "CC1"],
		CC3: ["CC4", "CC2"],
		CC4: ["CC5", "CC3", "CE0"],
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
		DT1: ["DT2"],
		DT2: ["DT3", "DT1"],
		DT3: ["DT5", "DT2"],
		DT5: ["DT6", "DT3"],
		DT6: ["DT7", "DT5"],
		DT7: ["DT8", "DT6"],
		DT8: ["DT9", "DT7"],
		DT9: ["DT10", "DT8", "CC19"],
		DT10: ["DT11", "DT9"],
		DT11: ["DT12", "NS21"],
		DT12: ["DT13", "DT11", "NE7"],
		DT13: ["DT14", "DT13"],
		DT14: ["DT15", "DT13", "EW12"],
		DT15: ["DT16", "DT14", "CC4"],
		DT16: ["DT17", "DT15", "CE1"],
		DT17: ["DT18", "DT16"],
		DT18: ["DT19", "DT17"],
		DT19: ["DT20", "DT18", "NE4"],
		DT20: ["DT21", "DT19"],
		DT21: ["DT22", "DT20"],
		DT22: ["DT23", "DT21"],
		DT23: ["DT24", "DT22"],
		DT24: ["DT25", "DT23"],
		DT25: ["DT26", "DT24"],
		DT26: ["DT27", "DT25", "CC10"],
		DT27: ["DT28", "DT26"],
		DT28: ["DT29", "DT27"],
		DT29: ["DT30", "DT28"],
		DT30: ["DT31", "DT29"],
		DT31: ["DT32", "DT30"],
		DT32: ["DT33", "DT31", "EW2"],
		DT33: ["DT34", "DT32"],
		DT34: ["DT35", "DT33"],
		DT35: ["DT34", "DT34", "CG1"],
		NE1: ["NE3", "CC29"],
		NE3: ["NE4", "NE1", "EW16"],
		NE4: ["NE5", "NE3", "DT19"],
		NE5: ["NE6", "NE4"],
		NE6: ["NE7", "NE5", "NS24", "CC1"],
		NE7: ["NE8", "NE6"],
		NE8: ["NE9", "NE7"],
		NE9: ["NE10", "NE8"],
		NE10: ["NE11", "NE9"],
		NE11: ["NE12", "NE10"],
		NE12: ["NE13", "NE11"],
		NE13: ["NE14", "NE12"],
		NE14: ["NE15", "NE13"],
		NE15: ["NE16", "NE14"],
		NE16: ["NE17", "NE15"],
		NE17: ["NE16"],
		TE1: ["TE2"],
		TE2: ["TE3", "TE1", "NS9"],
		TE3: ["TE4", "TE2"],
		TE4: ["TE5", "TE3"],
		TE5: ["TE6", "TE4"],
		TE6: ["TE7", "TE5"],
		TE7: ["TE8", "TE6"],
		TE8: ["TE9", "TE7"],
		TE9: ["TE10", "TE8", "CC17"],
		TE10: ["TE11", "TE9"],
		TE11: ["TE12", "TE10", "DT10"],
		TE12: ["TE13", "TE11"],
		TE13: ["TE14", "TE12"],
		TE14: ["TE15", "TE13", "NS22"],
		TE15: ["TE16", "TE14"],
		TE16: ["TE17", "TE15"],
		TE17: ["TE18", "TE16", "NE3", "EW16"],
		TE18: ["TE19", "TE17"],
		TE19: ["TE20", "TE18"],
		TE20: ["TE21", "TE19", "CE2", "NS27"],
		TE21: ["TE22", "TE20"],
		TE22: ["TE21"],
	},
	interchanges: {
		// Dhoby Ghout
		CC1: "NS24",
		NE6: "NS24",
		NS24: "NS24",
		// JE
		NS1: "NS1",
		EW24: "EW24",

		// Buona Vista
		EW21: "EW21",
		CC22: "EW21",

		// Outram Park
		EW16: "EW16",
		NE3: "EW16",
		TE17: "EW16",

		// HarbourFront
		NE1: "NE1",
		CC29: "NE1",

		// China Town
		NE4: "NE4",
		DT19: "NE4",

		// Raffles Place
		NS26: "NS26",
		EW14: "NS26",

		// City Hall
		NS25: "NS25",
		EW13: "NS25",

		// Marina Bay
		NS27: "NS27",
		CE2: "NS27",
		TE20: "NS27",

		// Bayfront
		CE1: "CE1",
		DT16: "CE1",

		// Promenade
		CC4: "CC4",
		DT15: "CC4",

		// Bugis
		EW12: "EW12",
		DT14: "EW12",

		// Little india
		NE7: "NE7",
		DT12: "NE7",

		// Newton
		NS21: "NS21",
		DT11: "NS21",

		// Bishan
		NS17: "NS17",
		CC15: "NS17",

		// Serangoon
		NE12: "NE12",
		CC13: "NE12",

		// Botanic Garden
		CC19: "CC19",
		DT9: "CC19",

		// Caldecott
		TE9: "TE9",
		CC17: "TE9",

		// Stevens
		DT10: "DT10",
		TE11: "DT10",

		// Orchard
		NS22: "NS22",
		TE14: "NS22",

		// Woodlands
		NS9: "NS9",
		TE2: "NS9",

		// Macpherson
		CC10: "CC10",
		DT26: "CC10",

		// Paya Lebar
		EW8: "EW8",
		CC9: "EW8",

		// Tampines
		EW2: "EW2",
		DT32: "EW2",

		// Expo
		CG1: "CG1",
		DT35: "DT35",
	},
};

export class MRT extends Graph<Line, LineQuery, Station> {
	interchanges;

	constructor(
		routes: Mapping<string[]> = mrtMap.routes,
		interChanges: Mapping<string | undefined> = mrtMap.interchanges
	) {
		super(routes, LineQuery);
		this.interchanges = interChanges;
	}

	static async createStations() {
		const data = await parse();
		return Object.values(data).reduce<Mapping<Station>>((accum, current) => {
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
		}, {});
	}

	async init() {
		const stations = await MRT.createStations();
		const lines: { [key: string]: Line } = {};
		for (const sourceId of Object.keys(this.routes)) {
			const targetIds = this.routes[sourceId as StationID];
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
		this.nodes = stations;
		this.edges = lines;
	}

	getLine(u: StationID, v: StationID) {
		const lineId = constructLineId(u, v);
		return this.getEdge(lineId);
	}

	query(edgeId: string, currentTime?: Date) {
		const edge = this.getEdge(edgeId);
		const edgeQuery = new this.edgeQuery(edge, currentTime);
		return edgeQuery;
	}

	computeCost(u: StationID, v: StationID, currentTime?: Date) {
		const lineQuery = new LineQuery(this.getLine(u, v), currentTime);
		return lineQuery.computeCost();
	}

	computeCostPaths(lineQueries: LineQuery[]) {
		return lineQueries.reduce(
			(totalDuration, currentLineQuery) =>
				totalDuration + currentLineQuery.computeCost(),
			0
		);
	}

	private findInterchangeRoot(u: string) {
		let i = u;
		const { interchanges } = this;
		while (interchanges[i] !== i) {
			i = interchanges[i] as string;
		}
		return i;
	}

	interchangeConnected(u: string, v: string) {
		const { interchanges } = this;
		if (!interchanges[u] || !interchanges[v]) return false;
		return this.findInterchangeRoot(u) === this.findInterchangeRoot(v);
	}
}
