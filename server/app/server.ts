import express from "express";
import cors from "cors";

// routes imports
import authRoutes from "./routes/authRoutes.ts";
import categoriesRoutes from "./routes/categoriesRoutes.ts";
import storesRoutes from "./routes/storesRoutes.ts";
import itemsRoutes from "./routes/itemRoutes.ts";
import listsRoutes from "./routes/listsRoutes.ts";

const app = express();

app.use(cors({ origin: "http://localhost:4321" }));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/stores", storesRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/lists", listsRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  process.exit();
});