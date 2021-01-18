const swap = <V>(arr: Array<V>, i: number, j: number) => {
	const temp = arr[i];
	arr[i] = arr[j];
	arr[j] = temp;
};
type CompareFn<V> = (a: V, b: V) => boolean;

export class Heap<V> {
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
