
// import dotenv from "dotenv"; 
// dotenv.config();
import 'dotenv/config';
import cors from "cors";
import authroute from "./modules/Auth/auth.routes.js";
import userRoute from "./modules/User/user.routes.js";
import express from 'express';

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// auth routes
app.use("/api/auth", authroute);

// user routes
app.use("/api/users", userRoute);

// test route
app.get("/", (req, res) => {
    res.send("API is running...");
  });
  
// start server
const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});