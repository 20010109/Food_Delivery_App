import { createUserProfile, getUserProfile, updateUserProfile } from "./user.service.js";

export const createProfile = async (req, res) => {
    try {
        const { user_id, full_name, role, contact_number, profile_image } = req.body;
        const profile = await createUserProfile({ user_id, full_name, role, contact_number, profile_image });
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getProfile = async (req, res) => {
    try {
        const user_id = req.params.id;
        const profile = await getUserProfile(user_id);
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const user_id = req.params.id;
        const { full_name, contact_number, profile_image } = req.body;
        const profile = await updateUserProfile(user_id, { full_name, contact_number, profile_image });
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}