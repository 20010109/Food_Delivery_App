import { createUserProfile, signupUser, loginUser } from "./auth.service.js";

export const createProfile = async (req, res) => {
  const user = req.user; // from middleware
  const { role } = req.body;

  const profile = await createUserProfile(user.id, role);

  res.json(profile);
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await signupUser(email, password);
    res.json({ message: 'User signed up successfully', data });
  } catch (error) {
    res.status(500).json({ error: error.message });   
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.json({ message: 'User logged in successfully', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}