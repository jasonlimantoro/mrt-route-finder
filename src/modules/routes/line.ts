import { Station } from "./station";
import { StationType } from "./types";
import { isNight, isPeak, stationCodeToLineType } from "./utils";

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
		} else if (isNight(currentTime)) {
			return 10;
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
	computeDuration(currentTime: Date): number {
		if (isPeak(currentTime)) {
			return 12;
		} else if (isNight(currentTime)) {
			return 10;
		} else {
			return 10;
		}
	}

	isOperating(_currentTime: Date): boolean {
		return true;
	}
}

export class CGLine extends Line {
	constructor(id: string, source: Station, target: Station) {
		super(id, source, target);
	}
	computeDuration(currentTime: Date): number {
		if (isPeak(currentTime)) {
			return 12;
		} else if (isNight(currentTime)) {
			return 10;
		} else {
			return 10;
		}
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
		} else if (isNight(currentTime)) {
			return 10;
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
	computeDuration(currentTime: Date): number {
		if (isPeak(currentTime)) {
			return 12;
		} else if (isNight(currentTime)) {
			return 10;
		} else {
			return 10;
		}
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
		if (stationCodeToLineType(source.id) !== stationCodeToLineType(target.id)) {
			return new InterchangeLine(id, source, target);
		}

		return new typeToClass[type](id, source, target);
	};
}

export class LineQuery {
	line;

	usingTimeConsideration;

	constructor(line: Line, usingTimeConsideration: boolean) {
		this.line = line;
		this.usingTimeConsideration = usingTimeConsideration;
	}

	computeDuration: (currentTime?: Date) => number = (currentTime) => {
		if (this.usingTimeConsideration) {
			return this.line.computeDuration(currentTime!);
		}
		return 1;
	};
}

export class InstructionLine {
	line;

	constructor(line: Line) {
		this.line = line;
	}

	getInstruction = (): string => {
		if (this.line instanceof InterchangeLine) {
			return `Change to ${this.line.target.data.line}`;
		} else {
			return `Take line ${this.line.source.data.line} from station ${this.line.source.id} to ${this.line.target.id}`;
		}
	};
}
