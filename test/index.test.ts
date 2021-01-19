import request from "supertest";
import { startServer } from "@app/server";

let app: Express.Application;

beforeAll(async () => {
	app = await startServer();
});

describe("Top Route", () => {
	it("Holland Vilage to Bugis: should return 8 stops", async () => {
		const query = `
		{
			route(
				source: "CC21"
				target: "DT14"
			) {
				... on RouteResponseSuccess {
					topRoute {
						numberOfStops
						stops
					}
				}
			}
		}
		`;
		const response = await request(app)
			.post("/graphql")
			.send({ query })
			.expect(200);
		expect(response.body.data.route.topRoute).toMatchObject({
			stops: [
				"CC21",
				"CC20",
				"CC19",
				"DT9",
				"DT10",
				"DT11",
				"DT12",
				"DT13",
				"DT14",
			],
			numberOfStops: 8,
		});
	});
	it("Boon Lay to Little India: should return 150 minutes, 14 stops, peak hours", async () => {
		const query = `
		{
			route(
				source: "EW27"
				target: "DT12"
				startTime: "2021-01-14T06:10+08:00"
			) {
				... on RouteResponseSuccess {
					topRoute {
						numberOfStops
						stops
						durationMinute
					}
				}
			}
		}
		`;
		const response = await request(app)
			.post("/graphql")
			.send({ query })
			.expect(200);
		expect(response.body.data.route.topRoute).toMatchObject({
			stops: [
				"EW27",
				"EW26",
				"EW25",
				"EW24",
				"EW23",
				"EW22",
				"EW21",
				"CC22",
				"CC21",
				"CC20",
				"CC19",
				"DT9",
				"DT10",
				"DT11",
				"DT12",
			],
			numberOfStops: 14,
			durationMinute: 150,
		});
	});
	it("Woodlands to Orchard: TE10 should not be visited because it is not yet opened", async () => {
		const response = await request(app)
			.post("/graphql")
			.send({
				query: `
				{
					route(
						source: "TE1"
						target: "NS22"
						startTime: "2021-01-14T04:43+08:00"
					)
					{
						... on RouteResponseSuccess {
							topRoute {
								durationMinute
								numberOfStops
								stops
							}
						}
					}
				}
				`,
			})
			.expect(200);
		expect(response.body.data.route.topRoute).toMatchInlineSnapshot(`
		Object {
		  "durationMinute": 146,
		  "numberOfStops": 15,
		  "stops": Array [
		    "TE1",
		    "TE2",
		    "TE3",
		    "TE4",
		    "TE5",
		    "TE6",
		    "TE7",
		    "TE8",
		    "TE9",
		    "CC17",
		    "CC19",
		    "DT9",
		    "DT10",
		    "DT11",
		    "NS21",
		    "NS22",
		  ],
		}
	`);
	});

	// this is the where dijkstra2 fails to recognize that there is no such path, while in ksp algorithm, it will correctly detect that there is no path
	it("Bedok to Changi: should not return path because CG line is not operating at night", async () => {
		const response = await request(app)
			.post("/graphql")
			.send({
				query: `
			{
				route(
					source: "EW5"
					target: "CG2"
					startTime: "2021-01-14T00:00+08:00"
				)
				{
					... on RouteResponseSuccess {
						topRoute {
							durationMinute
							numberOfStops
							stops
						}
					}
					... on RouteResponseError {
						message
					}
				}
			}
			`,
			})
			.expect(200);
		expect(response.body.data.route).toMatchInlineSnapshot(`
		Object {
		  "message": "No path found from EW5 to CG2",
		}
	`);
	});

	it("Outram Park to Somerset: prefer EW to NE line during peak hours", async () => {
		const response = await request(app)
			.post("/graphql")
			.send({
				query: `
			{
				route(
					source: "EW16"
					target: "NS23"
					startTime: "2021-01-14T06:40+08:00"
				)
				{
					... on RouteResponseSuccess {
						topRoute {
							durationMinute
							numberOfStops
							stops
						}
						alternativeRoutes {
							stops
							durationMinute
							numberOfStops
						}
					}
				}
			}
		`,
			})
			.expect(200);
		expect(response.body.data.route).toMatchInlineSnapshot(`
		Object {
		  "alternativeRoutes": Array [
		    Object {
		      "durationMinute": 71,
		      "numberOfStops": 6,
		      "stops": Array [
		        "EW16",
		        "EW15",
		        "EW14",
		        "NS26",
		        "NS25",
		        "NS24",
		        "NS23",
		      ],
		    },
		    Object {
		      "durationMinute": 78,
		      "numberOfStops": 6,
		      "stops": Array [
		        "EW16",
		        "NE3",
		        "NE4",
		        "NE5",
		        "NE6",
		        "NS24",
		        "NS23",
		      ],
		    },
		  ],
		  "topRoute": Object {
		    "durationMinute": 69,
		    "numberOfStops": 6,
		    "stops": Array [
		      "EW16",
		      "EW15",
		      "EW14",
		      "EW13",
		      "NS25",
		      "NS24",
		      "NS23",
		    ],
		  },
		}
	`);
	});

	it("City Hall (EW13) to Paya Lebar (CC9): stop at green line is fine (EW8)", async () => {
		const response = await request(app)
			.post("/graphql")
			.send({
				query: `
			{
				route(
					source: "EW13"
					target: "CC9"
					startTime: "2021-01-14T06:40+08:00"
				)
				{
					... on RouteResponseSuccess {
						topRoute {
							durationMinute
							numberOfStops
							stops
						}
					}
				}
			}
		`,
			})
			.expect(200);
		expect(response.body.data.route.topRoute).toMatchInlineSnapshot(`
		Object {
		  "durationMinute": 50,
		  "numberOfStops": 5,
		  "stops": Array [
		    "EW13",
		    "EW12",
		    "EW11",
		    "EW10",
		    "EW9",
		    "EW8",
		  ],
		}
	`);
	});
});
