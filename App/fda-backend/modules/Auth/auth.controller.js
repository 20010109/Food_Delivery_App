import { createUserProfile } from "./auth.service.js";

export const createProfile = async (req, res) => {
  const user = req.user; // from middleware
  const { role } = req.body;

  const profile = await createUserProfile(user.id, role);

  res.json(profile);
};