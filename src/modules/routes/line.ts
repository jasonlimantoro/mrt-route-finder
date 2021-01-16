import { Station } from "./station";
import { Instruction, StationType } from "./types";
import { isNight, isPeak } from "./utils";

export abstract class Line {
	id;

	source;

	target;

	constructor(id: string, source: Station, target: Station) {
		this.id = id;
		this.source = source;
		this.target = target;
	}

	abstract computeDuration(currentTime: Date): number;
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

export class LineQuery {
	line;

	currentTime?: Date;

	constructor(line: Line, currentTime?: Date) {
		this.line = line;
		this.currentTime = currentTime;
	}

	computeDuration() {
		if (this.currentTime) {
			return this.line.computeDuration(this.currentTime);
		}
		return 1;
	}

	hasTargetOpened() {
		if (this.currentTime) {
			return this.line.target.hasOpened(this.currentTime);
		}
		return true;
	}
}

export class InstructionLine {
	lineQuery;

	constructor(lineQuery: LineQuery) {
		this.lineQuery = lineQuery;
	}

	getInstruction = (): Instruction => {
		const { line } = this.lineQuery;
		const meta = {
			currentTime: this.lineQuery.currentTime?.toLocaleTimeString(),
			cost: this.lineQuery.computeDuration(),
		};
		if (this.lineQuery.line instanceof InterchangeLine) {
			return {
				text: `Change to ${line.target.data.line}`,
				meta,
			};
		} else {
			return {
				text: `Take line ${line.source.data.line} from ${line.source.id} to ${line.target.id}`,
				meta,
			};
		}
	};
}
