import { Color, StationData, StationType } from "./types";
import { Node } from "@app/lib/graph";

export abstract class Station extends Node {
	data;

	color: Color;

	constructor(id: string, data: StationData) {
		super(id);
		this.data = data;
	}

	hasOpened(currentTime: Date) {
		return currentTime.getTime() - this.data.openingDate.getTime() > 0;
	}
}

class EWStation extends Station {
	color = "green" as const;
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

class NSStation extends Station {
	color = "red" as const;
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

class CCStation extends Station {
	color = "yellow" as const;
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

class CGStation extends Station {
	color = "green" as const;
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

class NEStation extends Station {
	color = "purple" as const;
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

class CEStation extends Station {
	color = "yellow" as const;
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

class TEStation extends Station {
	color = "brown" as const;
	constructor(id: string, data: StationData) {
		super(id, data);
	}
}

class DTStation extends Station {
	color = "blue" as const;
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
