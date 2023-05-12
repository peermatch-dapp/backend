import express from "express";
import { PORT } from "./config";
import web3Listeners from "./web3Listeners";
import interestsRouter from "./routes/interestsRouter";
import onchainRouter from "./routes/onchainRouter";
import purposeRouter from "./routes/purposeRouter";

const app = express();

app.get("/", async (req, res) => {
  res.json({ message: "Hello World" });
});

app.use("/interests", interestsRouter);
app.use("/onchain", onchainRouter);
app.use("/purpose", purposeRouter);

web3Listeners();

app.listen(PORT, () => console.log(`The server is running on port ${PORT}`));
