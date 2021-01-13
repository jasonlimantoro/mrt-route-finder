import { StationID, StationType } from "./types";
import { isNight, isPeak, stationCodeToLineType } from "./utils";

export abstract class Line {
	id;

	source;

	target;

	constructor(id: string, source: StationID, target: StationID) {
		this.id = id;
		this.source = source;
		this.target = target;
	}

	abstract compute_travel_duration(currentTime: Date): number;
}

export class EWLine extends Line {
	constructor(id: string, source: StationID, target: StationID) {
		super(id, source, target);
	}

	compute_travel_duration(_currentTime: Date): number {
		return 10;
	}
}

export class NSLine extends Line {
	constructor(id: string, source: StationID, target: StationID) {
		super(id, source, target);
	}
	compute_travel_duration(currentTime: Date): number {
		if (isPeak(currentTime)) {
			return 12;
		} else if (isNight(currentTime)) {
			return 10;
		} else {
			return 10;
		}
	}
}

export class CCLine extends Line {
	constructor(id: string, source: StationID, target: StationID) {
		super(id, source, target);
	}
	compute_travel_duration(currentTime: Date): number {
		if (isPeak(currentTime)) {
			return 12;
		} else if (isNight(currentTime)) {
			return 10;
		} else {
			return 10;
		}
	}
}

export class CGLine extends Line {
	constructor(id: string, source: StationID, target: StationID) {
		super(id, source, target);
	}
	compute_travel_duration(currentTime: Date): number {
		if (isPeak(currentTime)) {
			return 12;
		} else if (isNight(currentTime)) {
			return 10;
		} else {
			return 10;
		}
	}
}

export class NELine extends Line {
	constructor(id: string, source: StationID, target: StationID) {
		super(id, source, target);
	}
	compute_travel_duration(currentTime: Date): number {
		if (isPeak(currentTime)) {
			return 12;
		} else if (isNight(currentTime)) {
			return 10;
		} else {
			return 10;
		}
	}
}

export class CELine extends Line {
	constructor(id: string, source: StationID, target: StationID) {
		super(id, source, target);
	}
	compute_travel_duration(currentTime: Date): number {
		if (isPeak(currentTime)) {
			return 12;
		} else if (isNight(currentTime)) {
			return 10;
		} else {
			return 10;
		}
	}
}

export class TELine extends Line {
	constructor(id: string, source: StationID, target: StationID) {
		super(id, source, target);
	}
	compute_travel_duration(currentTime: Date): number {
		if (isPeak(currentTime)) {
			return 12;
		} else if (isNight(currentTime)) {
			return 10;
		} else {
			return 10;
		}
	}
}

export class DTLine extends Line {
	constructor(id: string, source: StationID, target: StationID) {
		super(id, source, target);
	}
	compute_travel_duration(currentTime: Date): number {
		if (isPeak(currentTime)) {
			return 12;
		} else if (isNight(currentTime)) {
			return 10;
		} else {
			return 10;
		}
	}
}

export class InterchangeLine extends Line {
	constructor(id: string, source: StationID, target: StationID) {
		super(id, source, target);
	}
	compute_travel_duration = () => {
		return 0;
	};

	compute_transfer_duration = (currentTime: Date) => {
		if (isPeak(currentTime)) {
			return 15;
		}
		return 10;
	};
}

export class LineFactory {
	static create = (
		type: StationType,
		id: string,
		source: StationID,
		target: StationID
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
		if (stationCodeToLineType(source) !== stationCodeToLineType(target)) {
			return new InterchangeLine(id, source, target);
		}

		return new typeToClass[type](id, source, target);
	};
}
