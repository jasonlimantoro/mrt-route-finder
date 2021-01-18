import { StationType } from "./types";

export const isPeak = (currentTime: Date) => {
	const dayNumber = currentTime.getDay();
	const hours = currentTime.getHours();
	const morningPeak = hours >= 6 && hours < 9;
	const eveningPeak = hours >= 18 && hours < 21;
	const weekDay = dayNumber >= 1 && dayNumber <= 5;
	return weekDay && (morningPeak || eveningPeak);
};

export const isNight = (currentTime: Date) => {
	const hours = currentTime.getHours();
	const night = hours >= 22 && hours <= 23;
	const dawn = hours < 6;
	return night || dawn;
};

export const stationCodeToLineType = (code: string): StationType =>
	code.substr(0, 2) as StationType;

export const constructLineId = (src: string, target: string) => {
	return `${src}-${target}`;
};

export const addMinutes = (startTime: Date, minutes: number) => {
	const newTime = new Date(startTime);
	newTime.setMinutes(newTime.getMinutes() + minutes);
	return newTime;
};
