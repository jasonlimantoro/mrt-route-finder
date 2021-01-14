import { LineQuery } from "./line";
import { MrtMap, StationID, StationType } from "./types";

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
	const sorted = [src, target].sort();
	return [sorted[0], "-", sorted[1]].join("");
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
	cameFrom: { [key: string]: string },
	start: string,
	end: string
) => {
	const path: string[] = [];
	let current = end;
	while (current && current !== start) {
		path.push(current);
		current = cameFrom[current];
	}
	if (current) {
		path.push(start);
		return path.reverse();
	}
	return [];
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
	const pq = new Heap<Pair>(
		[[0, start, startTime ? new Date(startTime) : undefined]],
		(a, b) => a[0] < b[0]
	);
	distances[start] = 0;
	const cameFrom: { [key: string]: string } = {};
	cameFrom[start] = start;

	while (pq.length) {
		const [distance, currentStation, currentTime] = pq.pop();
		if (currentStation === end) {
			break;
		}
		for (const neighbor of map.routes[currentStation] || []) {
			const lineId = constructLineId(currentStation, neighbor);
			const line = map.entities.lines[lineId];
			const queryLine = new LineQuery(line, !!startTime);
			const cost = queryLine.compute_duration(currentTime);
			let newTime;
			if (currentTime) {
				newTime = new Date(
					currentTime.setMinutes(currentTime.getMinutes() + cost)
				);
			}
			const newCost = distance + cost;

			if (distances[neighbor] > newCost) {
				cameFrom[neighbor] = currentStation;
				pq.push([newCost, neighbor as StationID, newTime]);
				distances[neighbor] = newCost;
			}
		}
	}
	const duration = distances[end];
	const paths = reconstructPath(cameFrom, start, end);
	return { paths, duration };
};
