import { StationData, StationType } from "./types";

export abstract class Station {
	id;

	data;

	constructor(id: string, data: StationData) {
		this.id = id;
		this.data = data;
	}

	hasOpened(currentTime: Date) {
		return currentTime.getTime() - this.data.openingDate.getTime() > 0;
	}
}

class EWStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

class NSStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

class CCStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

class CGStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

class NEStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

class CEStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

class TEStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

class DTStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

export class StationFactory {
	static create = (type: StationType, id: string, data: StationData) => {
		const typeToClass = {
			EW: EWStation,
			NS: NSStation,
			CC: CCStation,
			CG: CGStation,
			NE: NEStation,
			CE: CEStation,
			TE: TEStation,
			DT: DTStation,
		};

		return new typeToClass[type](id, data);
	};
}
