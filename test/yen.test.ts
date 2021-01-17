import { yenAlgorithm } from "@app/lib/algorithm";

describe("Yen algorithm", () => {
	it("should work with four ksp", () => {
		const graphs = {
			A: ["E"],
			B: ["C"],
			C: ["F"],
			D: ["A", "E"],
			E: ["B", "F"],
			F: [],
		};
		const result = yenAlgorithm(graphs, "D", "F", 4);
		expect(result).toHaveLength(4);
		expect(result).toMatchSnapshot();
	});

	it("should work with linear graph", () => {
		const graphs = {
			A: ["B"],
			B: ["C"],
			C: ["D"],
			D: ["E"],
			E: ["F"],
			F: [],
		};
		const result = yenAlgorithm(graphs, "D", "F", 4);
		expect(result).toEqual([{ path: ["D", "E", "F"], cost: 2 }]);
	});

	it("should not go back and forth", () => {
		const graphs = {
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
		const k = 5;
		const result = yenAlgorithm(graphs, "D", "F", k);
		expect(result).toHaveLength(2);
	});
});
