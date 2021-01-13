import csv from "csv-parser";
import fs from "fs";
import path from "path";

export const parse = async () => {
	const results: {
		"Station Code": string;
		"Station Name": string;
		"Opening Date": string;
	}[] = [];
	const readStream = fs
		.createReadStream(path.join(__dirname, "./StationMap.csv"))
		.pipe(csv());
	for await (const row of readStream) {
		results.push(row);
	}
	return results;
};
