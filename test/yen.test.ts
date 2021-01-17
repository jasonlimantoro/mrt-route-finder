import { yenAlgorithm } from "@app/lib/algorithm";
import { Graph } from "@app/modules/routes/map";

class CustomGraph extends Graph {
	constructor(routes: { [key: string]: string[] }) {
		super(routes);
	}
	computeCost() {
		return 1;
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
		expect(result).toMatchSnapshot();
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
		expect(result).toEqual([{ path: ["D", "E", "F"], cost: 2 }]);
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
			{ cost: 2, path: ["D", "E", "F"] },
			{ cost: 8, path: ["D", "C", "B", "A", "G", "H", "I", "J", "F"] },
		]);
	});
});
