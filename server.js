import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./src/db/connect.js";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import errorHandler from "./src/helpers/errorhandler.js";

dotenv.config();

const port = process.env.PORT || 8000;

const app = express();

// Middleware
app.use(
  cors({
    origin: "https://hackathon-frontend-iota-navy.vercel.app/", // Specify the frontend URL
    credentials: true, // Allow credentials (cookies, HTTP authentication)
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Test API route
app.get("/api/v1/test", (req, res) => {
  res.status(200).json({ success: true, message: "API is working fine!" });
});

// Routes
const routeFiles = fs.readdirSync("./src/routes");

routeFiles.forEach((file) => {
  // Dynamic import of route files
  import(`./src/routes/${file}`)
    .then((route) => {
      app.use("/api/v1", route.default);
    })
    .catch((err) => {
      console.log("Failed to load route file", err);
    });
});

app.use(errorHandler);

// Vercel requires the export of the app instead of listening on a port
export default app;

// If running locally, start the server with listen
if (process.env.NODE_ENV !== "production") {
  const server = async () => {
    try {
      await connect();
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    } catch (error) {
      console.log("Failed to start server.....", error.message);
      process.exit(1);
    }
  };

  server();
}
