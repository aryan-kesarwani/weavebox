import express from "express";
import cors from "cors";
import mainRouter from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend requests
app.use(cors());

app.use(express.json());
app.use("/api/v1/arweave", mainRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api/v1/arweave`);
});
