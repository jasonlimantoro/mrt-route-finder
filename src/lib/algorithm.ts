import {
	InstructionLine,
	InterchangeLine,
	LineQuery,
} from "@app/modules/routes/line";
import { MRT } from "@app/modules/routes/map";
import { Route, StationID } from "@app/modules/routes/types";
import { addMinutes, constructLineId } from "@app/modules/routes/utils";
import isEqual from "lodash/isEqual";
import { Edge, EdgeQuery, Node, Graph } from "./graph";
import { Heap } from "./heap";

interface ShortestPath<Q> {
	path: string[];
	cost: number;
	edges: Q[];
}

export type ShortestPathAlgo<Q> = (...args: any[]) => ShortestPath<Q>;

/**
 * Dijkstra algorithm, agnostic of MRT, useful for testing yen's algorithm using simpler graph
 */
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

/**
 * @deprecated In favor of yen's algorithm.
 * This algorithm is not pure Dijkstra; it will not stop even if a destination is found (in order to find multiple shortest path)
 * However, this algorithm will find some non-sense paths if the both the source node and destination node lies on a "dead end" and there are
 * some forbidden transitions (e.g. station is not operating) such that even the first shortest path found requires moving backwards first and then forwards.
 * See Bedok to Changi test case in index.test.ts as an example.
 */
export const dijkstra2 = (
	mrt: MRT,
	start: StationID,
	end: StationID,
	startTime?: string
): Route[] => {
	type Pair = [number, StationID, LineQuery[], Date?];
	interface Path {
		routes: LineQuery[];
		duration: number;
	}
	const startTimeObject = startTime ? new Date(startTime) : undefined;
	const pq = new Heap<Pair>(
		[[0, start, [], startTimeObject]],
		(a, b) => a[0] < b[0]
	);
	const allPossiblePaths: Path[] = [];

	const isVisited = (station: string, paths: LineQuery[]) => {
		for (const p of paths) {
			if (p.line.target.id === station || p.line.source.id === station) {
				return true;
			}
		}
		return false;
	};

	const find = (x: StationID) => {
		let i = x;
		const { interchanges } = mrt;
		while (interchanges[i] !== i) {
			i = interchanges[i] as StationID;
		}
		return i;
	};

	const connected = (x: StationID, y: StationID) => {
		const { interchanges } = mrt;
		if (!interchanges[x] || !interchanges[y]) return false;
		const root1 = find(x);
		const root2 = find(y);
		return root1 === root2;
	};

	// It's hard to say what the upper bound is
	// One idea: since this limits to only 5 shortest paths, then the worst complexity would be 5 * O(Dijkstra)
	// O(Dijkstra) = O((M+N) log N), N is the number of vertices, M is the number of edges
	// Though it is not tight bound, it's sufficient to find 5 paths
	const MAX_BOUND = 5 * (mrt.numNodes + mrt.numEdges) * Math.log(mrt.numNodes);
	let i = 0;
	while (pq.length) {
		i++;
		if (i > MAX_BOUND) {
			break;
		}
		const [distance, currentStation, pathsSoFar, currentTime] = pq.pop();
		if (currentStation === end || connected(currentStation, end)) {
			allPossiblePaths.push({ routes: pathsSoFar, duration: distance });
			continue;
		}
		if (allPossiblePaths.length >= 5) {
			break;
		}
		const lastLineQuery = pathsSoFar[pathsSoFar.length - 1];
		for (const neighbor of mrt.routes[currentStation] || []) {
			const line = mrt.getLine(currentStation, neighbor as StationID);
			const lineQuery = new LineQuery(line, currentTime);
			const cost = lineQuery.computeCost();
			// Don't wait two times consecutively in station interchanges like Dhoby Ghout
			if (
				lastLineQuery?.line instanceof InterchangeLine &&
				lineQuery.line instanceof InterchangeLine
			) {
				continue;
			}

			if (!lineQuery.hasTargetOpened()) {
				continue;
			}

			if (!lineQuery.isOperating()) {
				continue;
			}

			let newTime = currentTime ? addMinutes(currentTime, cost) : undefined;
			if (!isVisited(neighbor, pathsSoFar)) {
				const newCost = distance + cost;
				pq.push([
					newCost,
					neighbor as StationID,
					[...pathsSoFar, lineQuery],
					newTime,
				]);
			}
		}
	}
	const allPossiblePathsWithInstructions = allPossiblePaths.map(
		({ routes, duration: durationMinute }) => {
			return {
				instructions: routes.map((lineQuery) =>
					new InstructionLine(lineQuery).getInstruction()
				),
				stops: [start, ...routes.map((lineQuery) => lineQuery.line.target.id)],
				durationMinute: startTimeObject ? durationMinute : undefined,
				numberOfStops: routes.length,
				arrivalTime: startTimeObject
					? addMinutes(startTimeObject, durationMinute).toLocaleTimeString()
					: undefined,
			};
		}
	);
	return allPossiblePathsWithInstructions;
};

/**
 * Algorithm to compute loopless K shortest path
 * Time Complexity: O(K * N * O(Dijkstra)), where O(Dijkstra) = O((M + N) log N)
 */
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
	if (path.length === 0) {
		return ksp;
	}
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
/**
 * MRT-aware Dijkstra
 */
export const dijkstra = (
	mrt: MRT,
	start: string,
	end: string,
	meta: { startTime?: string }
) => {
	type Pair = [number, string, boolean, LineQuery[], Date?];
	const distances = Object.keys(mrt.routes).reduce<{ [key: string]: number }>(
		(accum, current) => ({
			...accum,
			[current]: Infinity,
		}),
		{}
	);
	const startTimeObject = meta.startTime ? new Date(meta.startTime) : undefined;
	const pq = new Heap<Pair>(
		[[0, start, false, [], startTimeObject]],
		(a, b) => a[0] < b[0]
	);
	distances[start] = 0;
	const cameFrom: { [key: string]: [string, LineQuery?] } = {};
	cameFrom[start] = [start];

	while (pq.length) {
		const [
			distance,
			u,
			interchangeMovement,
			lineQueries,
			currentTime,
		] = pq.pop();
		if (u === end || mrt.interchangeConnected(u, end)) {
			const path = [start];
			for (const lineQuery of lineQueries) {
				path.push(lineQuery.line.target.id);
			}
			return {
				cost: mrt.computeCostPaths(lineQueries),
				path,
				edges: lineQueries,
			};
		}
		for (const v of mrt.routes[u]) {
			const lineQuery = mrt.query(constructLineId(u, v), currentTime);
			const cost = lineQuery.computeCost();
			let newTime;
			if (currentTime) {
				newTime = addMinutes(currentTime, cost);
			}
			const newCost = distance + cost;
			if (mrt.interchangeConnected(u, v) && interchangeMovement) {
				continue;
			}
			if (!lineQuery.hasTargetOpened()) {
				continue;
			}
			if (!lineQuery.isOperating()) {
				continue;
			}
			if (distances[v] > newCost) {
				distances[v] = newCost;
				cameFrom[v] = [u, lineQuery];
				pq.push([
					newCost,
					v,
					mrt.interchangeConnected(u, v),
					[...lineQueries, lineQuery],
					newTime,
				]);
			}
		}
	}
	return {
		cost: Infinity,
		path: [],
		edges: [],
	};
};
