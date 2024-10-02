import express from "express";
import {
  activeUserMiddleware,
  httpRequestDurationMiddleware,
} from "./monitoring/requestCount";
import client from "prom-client";

const app = express();

app.use(express.json());
app.use(httpRequestDurationMiddleware);
app.use(activeUserMiddleware);

app.get("/user", (req, res) => {
  res.json({
    message: "Hi there!",
  });
});

app.post("/user", (req, res) => {
  res.send({
    message: "User created successfully",
  });
});

app.get("/metrics", async (req, res) => {
  const metrics = await client.register.metrics();
  res.set("Content-Type", client.register.contentType);
  res.send(metrics);
});

app.listen(3000, () => console.log("Server is listening on port 3000"));
