// 0: sun
// 1: mon
// 2: tue
// 3: wed
// 4: thu
// 5: fri

import { StationType } from "./types";

// 6: sat
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
