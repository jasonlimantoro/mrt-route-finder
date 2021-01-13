import { StationData, StationType } from "./types";

export abstract class Station {
	id;

	data;

	constructor(id: string, data: StationData) {
		this.id = id;
		this.data = data;
	}

	abstract isOperating: (currentTime: Date) => boolean;
}

class EWStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}

	isOperating = () => true;
}

class NSStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}

	isOperating = () => true;
}

class CCStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}

	isOperating = () => true;
}

class CGStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}

	isOperating = () => true;
}

class NEStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}

	isOperating = () => true;
}

class CEStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}

	isOperating = () => true;
}

class TEStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}

	isOperating = () => true;
}

class DTStation extends Station {
	constructor(id: string, data: StationData) {
		super(id, data);
	}

	isOperating = () => true;
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
