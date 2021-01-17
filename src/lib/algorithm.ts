import { Heap } from "@app/modules/routes/utils";
import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";

export interface Graph<V = any> {
	[key: string]: V[];
}
interface ShortestPath {
	path: string[];
	cost: number;
}

export type ShortestPathAlgo<V extends String, M extends Object = {}> = (
	graph: Graph<V>,
	start: V,
	end: V,
	meta: M
) => ShortestPath;

const reconstructPath = (
	start: string,
	end: string,
	cameFrom: { [key: string]: string }
) => {
	const path: string[] = [];
	let current = end;

	while (current !== start) {
		if (!current) {
			return [];
		}
		path.push(current);
		current = cameFrom[current];
	}

	path.push(start);

	return path.reverse();
};

const vanilaDijkstra: ShortestPathAlgo<string> = (
	graph,
	start,
	end
): ShortestPath => {
	type Pair = [number, string];
	const distances = Object.keys(graph).reduce<{ [key: string]: number }>(
		(accum, current) => ({
			...accum,
			[current]: Infinity,
		}),
		{}
	);
	const pq = new Heap<Pair>([[0, start]], (a, b) => a[0] < b[0]);
	distances[start] = 0;
	const cameFrom: { [key: string]: string } = {};
	cameFrom[start] = start;

	while (pq.length) {
		const [distance, u] = pq.pop();
		if (u === end) {
			break;
		}
		for (const v of graph[u]) {
			const newCost = distance + 1;
			if (distances[v] > newCost) {
				distances[v] = newCost;
				cameFrom[v] = u;
				pq.push([newCost, v]);
			}
		}
	}
	const path = reconstructPath(start, end, cameFrom);

	return {
		cost: path.length - 1,
		path,
	};
};
export const yenAlgorithm = <V extends string, M extends Object = {}>(
	graph: Graph<V>,
	start: V,
	end: V,
	K: number,
	meta: M,
	shortestPathAlgorithm: ShortestPathAlgo<V, M> = vanilaDijkstra
) => {
	const ksp: ShortestPath[] = [];
	const candidates = new Heap<ShortestPath>([], (a, b) => a.cost < b.cost);
	const { path, cost } = shortestPathAlgorithm(graph, start, end, meta);
	ksp[0] = { path, cost };
	for (let k = 1; k < K; k++) {
		// find the cut (a.k.a spur node)
		for (let i = 0; i < ksp[k - 1].path.length - 1; i++) {
			const spurNode = ksp[k - 1].path[i];
			const rootPath = ksp[k - 1].path.slice(0, i + 1);
			const rootCost = rootPath.length - 1;
			const graphClone = cloneDeep(graph);
			for (const shortestPath of ksp) {
				if (
					shortestPath.path.length > i &&
					isEqual(rootPath, shortestPath.path.slice(0, i + 1))
				) {
					const edgeToBeRemovedIndex = graphClone[
						shortestPath.path[i]
					].findIndex((neighbor) => neighbor === shortestPath.path[i + 1]);
					if (edgeToBeRemovedIndex !== -1) {
						graphClone[shortestPath.path[i]].splice(edgeToBeRemovedIndex, 1);
					}
				}
			}
			for (const node of rootPath) {
				if (node !== spurNode) {
					delete graphClone[node];
				}
			}

			// a -> b -> c (spur node) -> d -> e -> f -> g
			// rootPath = [a,b,c], rootCost = 2 (rootPath.length - 1)
			// spurPath = [c,d,e,f,g], spurCost = 4 (spurPath.length - 1)
			// candidatePath = [a,b,c,d,e,f,g], candidateCost = 2 + 4 = 6
			const { path: spurPath } = shortestPathAlgorithm(
				graphClone,
				spurNode as any,
				end,
				meta
			);
			if (spurPath.length > 0) {
				const spurCost = spurPath.length - 1; // V - 1 edges for path with V nodes
				const candidatePath = [
					...rootPath.slice(0, rootPath.length - 1),
					...spurPath,
				];
				const candidateShortestPath: ShortestPath = {
					path: candidatePath,
					cost: rootCost + spurCost,
				};
				const duplicate =
					candidates.values.findIndex(
						({ cost, path }) =>
							cost === candidateShortestPath.cost &&
							isEqual(candidateShortestPath.path, path)
					) !== -1;
				if (!duplicate) {
					candidates.push(candidateShortestPath);
				}
			}
		}

		if (candidates.length === 0) {
			break;
		}

		const kthShortestPath = candidates.pop();
		ksp.push(kthShortestPath);
	}
	return ksp;
};
