import express from "express";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import cors from "cors";

import authRoutes from "./routes/authRoutes.ts";
import categoriesRoutes from "./routes/categoriesRoutes.ts";
import storesRoutes from "./routes/storesRoutes.ts";
import itemsRoutes from "./routes/itemRoutes.ts";
import listsRoutes from "./routes/listsRoutes.ts";

const PORT = process.env.PORT || 3000;

const app = express();

// > CORS 
app.use(cors({ origin: "http://localhost:4321", credentials: true }));

// > Cookie Session
const sessionMiddleware = cookieSession({
  name: "session",
  keys: ["key1", "key2", "key3"],
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// > Parsers
app.use(cookieParser("our unique encryption algorithm"));
app.use(sessionMiddleware);
app.use(express.json());

// > Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/stores", storesRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/lists", listsRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`);
});

process.on("SIGINT", () => {
  console.log("Server is closing.... now");
  process.exit();
});