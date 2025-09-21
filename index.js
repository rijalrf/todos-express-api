import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import TodoRoutes from "./routes/todoRoutes.js";
import TodoItemRoutes from "./routes/todoItemRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import AuthRoutes from "./routes/authRoutes.js";
import UserRoutes from "./routes/userRoutes.js";
import { cryptoHash } from "./utils/cryptoHash.js";

dotenv.config();

const app = express();

// trust first proxy
// description : when the app is behind a proxy (e.g., Heroku, Nginx, etc.)
app.set("trust proxy", 1);

// use express json
// description : to parse incoming requests with JSON payloads
app.use(express.json());

// use cors
// description : to allow cross-origin requests
app.use(
  cors({
    origin: process.env.CORS_ORIGIN.split(","),
    credentials: true,
  })
);

// use helmet
// description : to secure HTTP headers, helps to protect the app from some well-known web vulnerabilities
app.use(helmet());

app.post("/hash", (req, res) => {
  res.json(cryptoHash(req.body.text));
});

// routes
// description : to handle different endpoints of the application
app.use(AuthRoutes);
app.use(TodoRoutes);
app.use(TodoItemRoutes);
app.use(UserRoutes);

// error handler
// description : to handle errors that occur in the application
app.use(errorHandler);

// listen on port
// description : to start the server and listen for incoming requests on the specified port
app.listen(process.env.APP_PORT, () => {
  console.log(`Server Up and Running on Port ${process.env.APP_PORT}`);
});
