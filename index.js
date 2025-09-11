import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import TodoRouter from "./routes/TodoRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(TodoRouter);

app.listen(process.env.APP_PORT, () => {
  console.log("Server is running on port " + process.env.APP_PORT);
});
