import 'dotenv/config';
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
import express from "express";
import cors from "cors";
import { authenticate } from "./middleware/authMiddleware.js";
import { createProfile } from "./modules/Auth/auth.controller.js";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: error.message });
  }
  res.json({ user: data.user, session: data.session });
});
// Protected route to create a user profile
app.post("/api/auth/createProfile", authenticate, createProfile);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});