import { yenAlgorithm } from "@app/lib/algorithm";
import { Graph } from "@app/modules/routes/map";
import { Edge, EdgeQuery, Node } from "@app/lib/graph";

class CustomNode extends Node {
	constructor(id: string) {
		super(id);
	}
}
class CustomEdge extends Edge<CustomNode> {
	computeDuration(_currentTime: Date): number {
		return 1;
	}
}
class CustomQueryEdge extends EdgeQuery<CustomNode, Edge<CustomNode>> {
	constructor(e: Edge<CustomNode>) {
		super(e);
	}
}

class CustomGraph extends Graph<Edge<CustomNode>, CustomQueryEdge, CustomNode> {
	constructor(routes: { [key: string]: string[] }) {
		super(routes, CustomQueryEdge);
		this.init();
	}
	computeCost() {
		return 1;
	}
	computeCostPaths(paths: CustomQueryEdge[]) {
		return paths.length;
	}
	init() {
		const edges: { [key: string]: CustomEdge } = {};
		const nodes: { [key: string]: CustomNode } = {};
		for (const sourceId of Object.keys(this.routes)) {
			const targetIds = this.routes[sourceId];
			for (const targetId of targetIds) {
				const lineId = `${sourceId}-${targetId}`;
				const source = new CustomNode(sourceId);
				const target = new CustomNode(targetId);
				edges[lineId] = new CustomEdge(lineId, source, target);
				nodes[sourceId] = source;
				nodes[targetId] = target;
			}
			this.edges = edges;
			this.nodes = nodes;
		}
	}
}

describe("Yen algorithm", () => {
	it("should work with four ksp", () => {
		const adj = {
			A: ["E"],
			B: ["C"],
			C: ["F"],
			D: ["A", "E"],
			E: ["B", "F"],
			F: [],
		};
		const graph = new CustomGraph(adj);
		const result = yenAlgorithm(graph, "D", "F", 4, {});
		expect(result).toHaveLength(4);
		expect(result).toEqual([
			expect.objectContaining({ cost: 2, path: ["D", "E", "F"] }),
			expect.objectContaining({ cost: 3, path: ["D", "A", "E", "F"] }),
			expect.objectContaining({ cost: 4, path: ["D", "E", "B", "C", "F"] }),
			expect.objectContaining({
				cost: 5,
				path: ["D", "A", "E", "B", "C", "F"],
			}),
		]);
	});

	it("should work with linear graph", () => {
		const adj = {
			A: ["B"],
			B: ["C"],
			C: ["D"],
			D: ["E"],
			E: ["F"],
			F: [],
		};
		const graph = new CustomGraph(adj);
		const result = yenAlgorithm(graph, "D", "F", 4, {});
		expect(result).toEqual([
			expect.objectContaining({ path: ["D", "E", "F"], cost: 2 }),
		]);
	});

	it("should not go back and forth", () => {
		const adj = {
			A: ["B", "G"],
			B: ["C", "A"],
			C: ["D", "B"],
			D: ["E", "C"],
			E: ["F", "D"],
			F: ["E", "J"],
			G: ["A", "H"],
			H: ["G", "I"],
			I: ["J", "H"],
			J: ["I", "F"],
		};
		const graph = new CustomGraph(adj);
		const k = 5;
		const result = yenAlgorithm(graph, "D", "F", k, {});
		expect(result).toHaveLength(2);
		expect(result).toEqual([
			expect.objectContaining({ cost: 2, path: ["D", "E", "F"] }),
			expect.objectContaining({
				cost: 8,
				path: ["D", "C", "B", "A", "G", "H", "I", "J", "F"],
			}),
		]);
	});
});
