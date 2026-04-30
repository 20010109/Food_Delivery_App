import 'dotenv/config';
import express from "express";
import cors from "cors";
import authRoute from "./modules/Auth/auth.routes.js";
import userRoute from "./modules/User/user.routes.js";   
import restaurantRoute from "./modules/Restaurant/restaurant.routes.js";
import addressRoute from "./modules/Address/address.routes.js";                             
import menuRoute from "./modules/Menu/menu.routes.js"; 
import orderRoute from "./modules/Order/order.routes.js";
import reviewRoute from "./modules/Reviews/reviews.route.js";
import { supabase } from "./config/supabase.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());

// auth routes
app.use("/api/auth", authRoute);
// user routes
app.use("/api/users", userRoute);
// restaurant routes
app.use("/api/restaurants", restaurantRoute);                             
// address routes
app.use("/api/addresses", addressRoute);
// menu routes
app.use("/api/menu", menuRoute);
// order routes
app.use('/api/orders', orderRoute);
//review routes
app.use('api/reviews', reviewRoute)

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// // Login
// app.post('/api/auth/login', async (req, res) => {
//   const { email, password } = req.body;
//   const { data, error } = await supabase.auth.signInWithPassword({ email, password });

//   if (error) {
//     return res.status(401).json({ error: error.message });
//   }
//   res.json({ user: data.user, session: data.session });
// });
// // Protected route to create a user profile
// app.post("/api/auth/createProfile", authenticate, createProfile);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});