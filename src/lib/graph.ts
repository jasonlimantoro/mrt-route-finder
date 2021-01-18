import { addMinutes } from "@app/modules/routes/utils";

export abstract class Node {
	id;
	constructor(id: string) {
		this.id = id;
	}
}

export abstract class Edge<N extends Node> {
	id;
	source;
	target;

	constructor(id: string, source: N, target: N) {
		this.id = id;
		this.source = source;
		this.target = target;
	}
	abstract computeDuration(currentTime: Date): number;
}

export abstract class EdgeQuery<N extends Node, E extends Edge<N>> {
	edge;
	currentTime?: Date;
	constructor(edge: E, currentTime?: Date) {
		this.edge = edge;
		this.currentTime = currentTime;
	}

	get endTime() {
		if (this.currentTime) {
			return addMinutes(this.currentTime, this.computeCost());
		}
		return null;
	}

	computeCost() {
		if (this.currentTime) {
			return this.edge.computeDuration(this.currentTime);
		}
		return 1;
	}
}
