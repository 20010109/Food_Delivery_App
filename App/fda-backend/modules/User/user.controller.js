import { createUserProfile, getUserProfile, updateUserProfile } from "./user.service.js";

export const createProfile = async (req, res) => {
    try {
        const authUser = req.user.id;
        const { first_name, last_name, role, contact_number, profile_image } = req.body;
            if(!role){
                return res.status(400).json({ error: 'role is required' });
            }

        const profile = await createUserProfile({
            user_id: authUser, 
            first_name, 
            last_name, 
            role, 
            contact_number, 
            profile_image 
        });

        return res.status(201).json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getProfile = async (req, res) => {
    try {
        const authUser = req.user.id;
        const user_id = req.params.id;
        if(authUser !== user_id){
            return res.status(403).json({ error: 'Forbidden' });
        }
        const profile = await getUserProfile(user_id);
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const authUser = req.user.id;
        const user_id = req.params.id;
        if(authUser !== user_id){
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { first_name, last_name, contact_number, profile_image } = req.body;
        const profile = await updateUserProfile(user_id, { first_name, last_name, contact_number, profile_image });
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}