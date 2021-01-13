require("dotenv").config();
import { startServer } from "./server";

const port = process.env.PORT || 4000;
startServer().then((app) =>
	app.listen(port, () => {
		// eslint-disable-next-line no-console
		console.log("Listening on port", port);
	})
);
