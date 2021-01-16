import { InstructionLine, InterchangeLine, LineQuery } from "./line";
import { mrtMap } from "./map";
import { Instruction, MrtMap, Route, StationID, StationType } from "./types";

export const isPeak = (currentTime: Date) => {
	const dayNumber = currentTime.getDay();
	const hours = currentTime.getHours();
	const morningPeak = hours >= 6 && hours <= 9;
	const eveningPeak = hours >= 18 && hours <= 21;
	const weekDay = dayNumber >= 1 && dayNumber <= 5;
	return weekDay && (morningPeak || eveningPeak);
};

export const isNight = (currentTime: Date) => {
	const hours = currentTime.getHours();
	const night = hours >= 22 && hours <= 23;
	const dawn = hours <= 6;
	return night || dawn;
};

export const stationCodeToLineType = (code: string): StationType =>
	code.substr(0, 2) as StationType;

const swap = <V>(arr: Array<V>, i: number, j: number) => {
	const temp = arr[i];
	arr[i] = arr[j];
	arr[j] = temp;
};

export const constructLineId = (src: string, target: string) => {
	return `${src}-${target}`;
};

type CompareFn<V> = (a: V, b: V) => boolean;

export default class Heap<V> {
	values: V[];

	length: number;

	compareFn: CompareFn<V>;

	constructor(values: Array<V>, compareFn: CompareFn<V>) {
		this.values = values;
		this.length = values.length;
		this.compareFn = compareFn;
		for (let i = Math.floor(values.length / 2); i >= 0; i--) {
			this.heapify(i);
		}
	}

	heapify(i: number) {
		const left = 2 * i + 1;
		const right = 2 * i + 2;

		let smallestIndex = i;
		if (
			left < this.length &&
			this.compareFn(this.values[left], this.values[smallestIndex])
		) {
			smallestIndex = left;
		}
		if (
			right < this.length &&
			this.compareFn(this.values[right], this.values[smallestIndex])
		) {
			smallestIndex = right;
		}
		if (i !== smallestIndex) {
			swap(this.values, i, smallestIndex);
			this.heapify(smallestIndex);
		}
	}

	pop(): V {
		if (this.length === 1) {
			this.length--;
			return this.values.pop() as V;
		}
		const root = this.values[0];
		this.values[0] = this.values.pop() as V;
		this.length--;
		for (let i = this.length - 1; i >= 0; i--) {
			this.heapify(i);
		}
		return root;
	}

	private siftUp(i: number) {
		let currentIndex = i;
		while (currentIndex > 0) {
			const parentIndex = Math.floor(currentIndex / 2);
			if (this.compareFn(this.values[currentIndex], this.values[parentIndex])) {
				swap(this.values, currentIndex, parentIndex);
				currentIndex = parentIndex;
			} else {
				break;
			}
		}
	}

	push(value: V) {
		this.length++;
		this.values.push(value);
		this.siftUp(this.length - 1);
	}
}

const reconstructPath = (
	cameFrom: { [key: string]: [string, LineQuery?] },
	start: string,
	end: string
) => {
	const path: LineQuery[] = [];
	let current = end;
	while (current && current !== start) {
		const [parent, lineQuery] = cameFrom[current];
		current = parent;
		if (lineQuery) {
			path.push(lineQuery);
		}
	}
	if (current) {
		return path.reverse();
	}
	return [];
};

const reconstructInstructions = (paths: LineQuery[]) => {
	const instructions: Instruction[] = [];
	for (const lineQuery of paths) {
		const instructionLine = new InstructionLine(lineQuery);
		instructions.push(instructionLine.getInstruction());
	}

	return instructions;
};

export const dijksta = (
	map: MrtMap,
	start: StationID,
	end: StationID,
	startTime?: string
) => {
	const distances = Object.keys(map.entities.stations).reduce<{
		[key: string]: number;
	}>((accum, current) => ({ ...accum, [current]: Infinity }), {});
	type Pair = [number, StationID, Date?];
	const startTimeObject = startTime ? new Date(startTime) : undefined;
	const pq = new Heap<Pair>(
		[[0, start, startTimeObject]],
		(a, b) => a[0] < b[0]
	);
	distances[start] = 0;
	const cameFrom: { [key: string]: [string, LineQuery?] } = {};
	cameFrom[start] = [start];

	while (pq.length) {
		const [distance, currentStation, currentTime] = pq.pop();
		if (currentStation === end) {
			break;
		}
		for (const neighbor of map.routes[currentStation] || []) {
			const lineId = constructLineId(currentStation, neighbor);
			const line = map.entities.lines[lineId];
			const lineQuery = new LineQuery(line, currentTime);
			const cost = lineQuery.computeDuration();
			let newTime;
			if (currentTime) {
				newTime = new Date(currentTime);
				newTime.setMinutes(newTime.getMinutes() + cost);
			}
			const newCost = distance + cost;

			if (distances[neighbor] > newCost) {
				cameFrom[neighbor] = [currentStation, lineQuery];
				pq.push([newCost, neighbor as StationID, newTime]);
				distances[neighbor] = newCost;
			}
		}
	}
	const duration = distances[end];
	const paths = reconstructPath(cameFrom, start, end);
	const instructions = reconstructInstructions(paths);
	return { paths, duration, instructions };
};

const addMinutes = (startTime: Date, minutes: number) => {
	const newTime = new Date(startTime);
	newTime.setMinutes(newTime.getMinutes() + minutes);
	return newTime;
};

export const dijkstra2 = (
	map: MrtMap,
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
		const { interchanges } = mrtMap.entities;
		while (interchanges[i] !== i) {
			i = interchanges[i] as StationID;
		}
		return i;
	};

	const connected = (x: StationID, y: StationID) => {
		const { interchanges } = mrtMap.entities;
		if (!interchanges[x] || !interchanges[y]) return false;
		const root1 = find(x);
		const root2 = find(y);
		return root1 === root2;
	};

	while (pq.length) {
		const [distance, currentStation, pathsSoFar, currentTime] = pq.pop();
		if (currentStation === end || connected(currentStation, end)) {
			allPossiblePaths.push({ routes: pathsSoFar, duration: distance });
			continue;
		}
		if (allPossiblePaths.length >= 5) {
			break;
		}
		const lastLineQuery = pathsSoFar[pathsSoFar.length - 1];
		for (const neighbor of map.routes[currentStation] || []) {
			const lineId = constructLineId(currentStation, neighbor);
			const line = map.entities.lines[lineId];
			const lineQuery = new LineQuery(line, currentTime);
			const cost = lineQuery.computeDuration();
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
