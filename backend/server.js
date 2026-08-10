require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const analyze = require("./analyzer");
const Lead = require("./models/Lead");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.json({ message: "API running" }));

app.post("/api/audit", async (req, res) => {
  try {
    res.json(await analyze(req.body.url));
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(400).json({ error: err.response?.data?.error?.message || err.message });
  }
});

app.post("/api/leads", async (req, res) => {
  try {
    await Lead.create(req.body);
    res.json({ message: "Lead saved successfully" });
  } catch {
    res.status(500).json({ error: "Failed to save lead" });
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

app.listen(process.env.PORT || 5000, () =>
  console.log("Server: http://localhost:5000")
);