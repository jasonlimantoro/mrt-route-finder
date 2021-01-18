import { Graph } from "@app/modules/routes/map";
import { Heap } from "@app/modules/routes/utils";
import isEqual from "lodash/isEqual";
import { Edge, EdgeQuery, Node } from "./graph";

interface ShortestPath<Q> {
	path: string[];
	cost: number;
	edges: Q[];
}

export type ShortestPathAlgo<Q> = (...args: any[]) => ShortestPath<Q>;

const vanilaDijkstra = <
	E extends Edge<N>,
	Q extends EdgeQuery<N, E>,
	N extends Node
>(
	graph: Graph<E, Q, N>,
	start: string,
	end: string
): ShortestPath<Q> => {
	type Pair = [number, string, Q[]];
	const distances = Object.keys(graph.routes).reduce<{ [key: string]: number }>(
		(accum, current) => ({
			...accum,
			[current]: Infinity,
		}),
		{}
	);
	const pq = new Heap<Pair>([[0, start, []]], (a, b) => a[0] < b[0]);
	distances[start] = 0;
	const cameFrom: { [key: string]: string } = {};
	cameFrom[start] = start;
	let allQueries: Q[] = [];
	while (pq.length) {
		const [distance, u, currentEdgeQueries] = pq.pop();
		if (u === end) {
			allQueries = currentEdgeQueries;
			break;
		}
		for (const v of graph.routes[u]) {
			const edgeQuery = graph.query(`${u}-${v}`);
			const newCost = distance + edgeQuery.computeCost();
			if (distances[v] > newCost) {
				distances[v] = newCost;
				cameFrom[v] = u;
				pq.push([newCost, v, [...currentEdgeQueries, edgeQuery]]);
			}
		}
	}
	if (allQueries.length > 0) {
		const path = [start];
		for (const edgeQuery of allQueries) {
			path.push(edgeQuery.edge.target.id);
		}
		return {
			cost: graph.computeCostPaths(allQueries),
			path,
			edges: allQueries,
		};
	}
	return {
		cost: Infinity,
		path: [],
		edges: [],
	};
};
export const yenAlgorithm = <
	E extends Edge<N>,
	Q extends EdgeQuery<Node, E>,
	N extends Node
>(
	graph: Graph<E, Q, N>,
	start: string,
	end: string,
	K: number,
	meta: any,
	shortestPathAlgorithm: ShortestPathAlgo<Q> = vanilaDijkstra
) => {
	const ksp: ShortestPath<Q>[] = [];
	const candidates = new Heap<ShortestPath<Q>>([], (a, b) => a.cost < b.cost);
	const { path, cost, edges } = shortestPathAlgorithm(graph, start, end, meta);
	ksp[0] = { path, cost, edges };
	for (let k = 1; k < K; k++) {
		// find the cut (a.k.a spur node)
		for (let i = 0; i < ksp[k - 1].path.length - 1; i++) {
			const spurNode = ksp[k - 1].path[i];
			const spurEdge = ksp[k - 1].edges[i - 1];
			const rootPath = ksp[k - 1].path.slice(0, i + 1);
			const rootEdges = ksp[k - 1].edges.slice(0, i);
			const edgesRemoved: [string, string][] = [];
			const nodesRemoved: { [key: string]: string[] } = {};
			for (const shortestPath of ksp) {
				if (
					shortestPath.path.length > i &&
					isEqual(rootPath, shortestPath.path.slice(0, i + 1))
				) {
					const edgeToBeRemovedIndex = graph.routes[
						shortestPath.path[i]
					].findIndex((neighbor) => neighbor === shortestPath.path[i + 1]);
					if (edgeToBeRemovedIndex !== -1) {
						edgesRemoved.push([shortestPath.path[i], shortestPath.path[i + 1]]);
						graph.removeEdge(shortestPath.path[i], shortestPath.path[i + 1]);
					}
				}
			}
			for (const node of rootPath) {
				if (node !== spurNode) {
					nodesRemoved[node] = graph.routes[node];
					graph.removeNode(node);
				}
			}

			const { path: spurPath, edges: spurEdges } = shortestPathAlgorithm(
				graph,
				spurNode,
				end,
				{
					startTime: spurEdge ? spurEdge.endTime : meta.startTime,
				}
			);
			if (spurPath.length > 0) {
				const candidatePath = [
					...rootPath.slice(0, rootPath.length - 1),
					...spurPath,
				];
				const candidateEdges = [...rootEdges, ...spurEdges];
				const candidateShortestPath: ShortestPath<Q> = {
					path: candidatePath,
					cost: graph.computeCostPaths(candidateEdges),
					edges: candidateEdges,
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
			for (const [u, v] of edgesRemoved) {
				graph.addEdge(u, v);
			}
			for (const node in nodesRemoved) {
				graph.addNode(node, nodesRemoved[node]);
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
