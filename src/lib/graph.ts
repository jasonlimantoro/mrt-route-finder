import { Mapping } from "@app/modules/routes/types";
import { addMinutes } from "@app/modules/routes/utils";

export abstract class Graph<
	E extends Edge<N>,
	Q extends EdgeQuery<N, E>,
	N extends Node
> {
	routes;

	nodes: Mapping<N>;

	edges: Mapping<E>;

	edgeQuery;

	constructor(routes: Mapping<string[]>, edgeQuery: new (e: E, d?: Date) => Q) {
		this.routes = routes;
		this.edgeQuery = edgeQuery;
	}
	get numNodes() {
		return Object.keys(this.nodes).length;
	}
	get numEdges() {
		return Object.keys(this.edges).length;
	}
	addEdge(u: string, v: string) {
		this.routes[u].push(v);
	}
	addNode(u: string, neighbors: string[]) {
		this.routes[u] = neighbors;
	}
	removeEdge(u: string, v: string) {
		this.routes[u] = this.routes[u].filter((nei) => nei !== v);
	}
	removeNode(u: string) {
		delete this.routes[u];
	}
	getEdge(id: string) {
		return this.edges[id];
	}

	query(edgeId: string) {
		const edgeQuery = new this.edgeQuery(this.getEdge(edgeId));
		return edgeQuery;
	}
	abstract computeCost(u: string, v: string): number;

	abstract computeCostPaths(edgeQueries: Q[]): number;
}
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
