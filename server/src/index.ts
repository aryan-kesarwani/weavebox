import express from "express";
import cors from "cors";
import { mainRouter } from "./routes";


const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend requests
app.use(cors());

app.use(express.json());
app.use("/weavebox/api/v1", mainRouter);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/weavebox/api/v1`);
});
