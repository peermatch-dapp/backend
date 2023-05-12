import express from "express";
import { PORT } from "./config";
import web3Listeners from "./web3Listeners";

const app = express();

app.get("/", async (req, res) => {
  res.json({ message: "Hello World" });
});

web3Listeners();

app.listen(PORT, () => console.log(`The server is running on port ${PORT}`));
