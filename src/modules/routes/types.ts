import { createUnionType, Field, Int, ObjectType } from "type-graphql";

export type Color = "red" | "green" | "yellow" | "blue" | "purple" | "brown";
export type StationType = "NS" | "EW" | "CC" | "CG" | "NE" | "CE" | "TE" | "DT";
export type StationID =
	| "NS1"
	| "NS2"
	| "NS3"
	| "NS4"
	| "NS5"
	| "NS7"
	| "NS8"
	| "NS9"
	| "NS10"
	| "NS11"
	| "NS12"
	| "NS13"
	| "NS14"
	| "NS15"
	| "NS16"
	| "NS17"
	| "NS18"
	| "NS19"
	| "NS20"
	| "NS21"
	| "NS22"
	| "NS23"
	| "NS24"
	| "NS25"
	| "NS26"
	| "NS27"
	| "NS28"
	| "EW1"
	| "EW2"
	| "EW3"
	| "EW4"
	| "EW5"
	| "EW6"
	| "EW7"
	| "EW8"
	| "EW9"
	| "EW10"
	| "EW11"
	| "EW12"
	| "EW13"
	| "EW14"
	| "EW15"
	| "EW16"
	| "EW17"
	| "EW18"
	| "EW19"
	| "EW20"
	| "EW21"
	| "EW22"
	| "EW23"
	| "EW24"
	| "EW25"
	| "EW26"
	| "EW27"
	| "EW28"
	| "EW29"
	| "EW30"
	| "EW31"
	| "EW32"
	| "EW33"
	| "CG0"
	| "CG1"
	| "CG2"
	| "NE1"
	| "NE3"
	| "NE4"
	| "NE5"
	| "NE6"
	| "NE7"
	| "NE8"
	| "NE9"
	| "NE10"
	| "NE11"
	| "NE12"
	| "NE13"
	| "NE14"
	| "NE15"
	| "NE16"
	| "NE17"
	| "CC1"
	| "CC2"
	| "CC3"
	| "CC4"
	| "CC5"
	| "CC6"
	| "CC7"
	| "CC8"
	| "CC9"
	| "CC10"
	| "CC11"
	| "CC12"
	| "CC13"
	| "CC14"
	| "CC15"
	| "CC16"
	| "CC17"
	| "CC19"
	| "CC20"
	| "CC21"
	| "CC22"
	| "CC23"
	| "CC24"
	| "CC25"
	| "CC26"
	| "CC27"
	| "CC28"
	| "CC29"
	| "CE0"
	| "CE1"
	| "CE2"
	| "DT1"
	| "DT2"
	| "DT3"
	| "DT5"
	| "DT6"
	| "DT7"
	| "DT8"
	| "DT9"
	| "DT10"
	| "DT11"
	| "DT12"
	| "DT13"
	| "DT14"
	| "DT15"
	| "DT16"
	| "DT17"
	| "DT18"
	| "DT19"
	| "DT20"
	| "DT21"
	| "DT22"
	| "DT23"
	| "DT24"
	| "DT25"
	| "DT26"
	| "DT27"
	| "DT28"
	| "DT29"
	| "DT30"
	| "DT31"
	| "DT32"
	| "DT33"
	| "DT34"
	| "DT35"
	| "TE1"
	| "TE2"
	| "TE3"
	| "TE4"
	| "TE5"
	| "TE6"
	| "TE7"
	| "TE8"
	| "TE9"
	| "TE10"
	| "TE11"
	| "TE12"
	| "TE13"
	| "TE14"
	| "TE15"
	| "TE16"
	| "TE17"
	| "TE18"
	| "TE19"
	| "TE20"
	| "TE21"
	| "TE22";

type Routes = {
	[K in StationID]: StationID[];
};

export interface StationData {
	id: StationID;
	name: string;
	line: StationType;
	openingDate: Date;
}

export interface LineData {
	source: StationID;
	target: StationID;
}

export interface Mapping<V> {
	[key: string]: V;
}

type InterChangeMapping = {
	[key in StationID]?: StationID;
};
export interface MrtMap {
	routes: Routes;
	interchanges: InterChangeMapping;
}

@ObjectType()
class InstructionMeta {
	@Field(() => String, { nullable: true })
	currentTime?: string;

	@Field(() => Int)
	cost: number;

	@Field(() => String)
	from: string;

	@Field(() => String)
	to: string;
}
@ObjectType()
export class Instruction {
	@Field(() => String)
	text: string;

	@Field(() => InstructionMeta)
	meta: InstructionMeta;
}

@ObjectType()
export class Route {
	@Field(() => [Instruction!]!)
	instructions: Instruction[];

	@Field(() => [String!]!)
	stops: string[];

	@Field(() => Int!)
	numberOfStops: number;

	@Field(() => Int!, { nullable: true })
	durationMinute?: number;

	@Field(() => String, { nullable: true })
	arrivalTime?: string;
}

@ObjectType()
export class RouteResponseSuccess {
	allRoutes: Route[];
}

@ObjectType()
export class RouteResponseError {
	@Field(() => String)
	message: string;
}

export const RouteResponse = createUnionType({
	name: "RouteResponse",
	types: () => [RouteResponseSuccess, RouteResponseError] as const,
	resolveType: (value) => {
		if ("message" in value) {
			return RouteResponseError;
		}
		if ("allRoutes" in value) {
			return RouteResponseSuccess;
		}
		return undefined;
	},
});
