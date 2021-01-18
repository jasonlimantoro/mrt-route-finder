import { Edge, EdgeQuery } from "@app/lib/graph";
import { Station } from "./station";
import { Instruction, StationType } from "./types";
import { isNight, isPeak } from "./utils";

export abstract class Line extends Edge<Station> {
	constructor(id: string, source: Station, target: Station) {
		super(id, source, target);
	}

	abstract isOperating(currentTime: Date): boolean;
}

export class EWLine extends Line {
	constructor(id: string, source: Station, target: Station) {
		super(id, source, target);
	}

	computeDuration(_currentTime: Date): number {
		return 10;
	}

	isOperating(_currentTime: Date): boolean {
		return true;
	}
}

export class NSLine extends Line {
	constructor(id: string, source: Station, target: Station) {
		super(id, source, target);
	}
	computeDuration(currentTime: Date): number {
		if (isPeak(currentTime)) {
			return 12;
		} else {
			return 10;
		}
	}
	isOperating(_currentTime: Date): boolean {
		return true;
	}
}

export class CCLine extends Line {
	constructor(id: string, source: Station, target: Station) {
		super(id, source, target);
	}
	computeDuration(_currentTime: Date): number {
		return 10;
	}

	isOperating(_currentTime: Date): boolean {
		return true;
	}
}

export class CGLine extends Line {
	constructor(id: string, source: Station, target: Station) {
		super(id, source, target);
	}
	computeDuration(_currentTime: Date): number {
		return 10;
	}

	isOperating(currentTime: Date): boolean {
		return !isNight(currentTime);
	}
}

export class NELine extends Line {
	constructor(id: string, source: Station, target: Station) {
		super(id, source, target);
	}
	computeDuration(currentTime: Date): number {
		if (isPeak(currentTime)) {
			return 12;
		} else {
			return 10;
		}
	}
	isOperating(_currentTime: Date): boolean {
		return true;
	}
}

export class CELine extends Line {
	constructor(id: string, source: Station, target: Station) {
		super(id, source, target);
	}
	computeDuration(_currentTime: Date): number {
		return 10;
	}

	isOperating(currentTime: Date): boolean {
		return !isNight(currentTime);
	}
}

export class TELine extends Line {
	constructor(id: string, source: Station, target: Station) {
		super(id, source, target);
	}
	computeDuration(currentTime: Date): number {
		if (isNight(currentTime) || !isPeak(currentTime)) {
			return 8;
		} else {
			return 10;
		}
	}
	isOperating(_currentTime: Date): boolean {
		return true;
	}
}

export class DTLine extends Line {
	constructor(id: string, source: Station, target: Station) {
		super(id, source, target);
	}
	computeDuration(currentTime: Date): number {
		if (!isPeak(currentTime)) {
			return 8;
		}
		return 10;
	}

	isOperating(currentTime: Date): boolean {
		return !isNight(currentTime);
	}
}

export class InterchangeLine extends Line {
	constructor(id: string, source: Station, target: Station) {
		super(id, source, target);
	}
	computeDuration(currentTime: Date) {
		return this.compute_transfer_duration(currentTime);
	}

	isOperating(_currentTime: Date): boolean {
		return true;
	}

	compute_transfer_duration(currentTime: Date) {
		if (isPeak(currentTime)) {
			return 15;
		}
		return 10;
	}
}

export class LineFactory {
	static create = (
		type: StationType,
		id: string,
		source: Station,
		target: Station
	) => {
		const typeToClass = {
			EW: EWLine,
			NS: NSLine,
			CC: CCLine,
			CG: CGLine,
			NE: NELine,
			CE: CELine,
			TE: TELine,
			DT: DTLine,
		};
		if (source.color !== target.color) {
			return new InterchangeLine(id, source, target);
		}

		return new typeToClass[type](id, source, target);
	};
}

export class LineQuery extends EdgeQuery<Station, Line> {
	line;

	constructor(line: Line, currentTime?: Date) {
		super(line, currentTime);
		this.line = line;
	}

	hasTargetOpened() {
		if (this.currentTime) {
			return this.line.target.hasOpened(this.currentTime);
		}
		return true;
	}

	isOperating() {
		if (this.currentTime) {
			return this.line.isOperating(this.currentTime);
		}
		return true;
	}
}

export class InstructionLine {
	lineQuery;

	constructor(lineQuery: EdgeQuery<Station, Edge<Station>>) {
		this.lineQuery = lineQuery;
	}

	getInstruction = (): Instruction => {
		const { source, target } = this.lineQuery.edge;
		const meta = {
			currentTime: this.lineQuery.currentTime?.toLocaleTimeString(),
			cost: this.lineQuery.computeCost(),
			from: source.id,
			to: target.id,
		};
		if (this.lineQuery.edge instanceof InterchangeLine) {
			return {
				text: `Change to ${target.data.line} at ${target.data.name}`,
				meta,
			};
		} else {
			return {
				text: `Take line ${source.data.line} from ${source.data.name} to ${target.data.name}`,
				meta,
			};
		}
	};
}
