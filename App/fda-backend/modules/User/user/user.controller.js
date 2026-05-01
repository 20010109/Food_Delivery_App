import { createUserProfile, getUserProfile, updateUserProfile, updateUserRole, setupUserService } from "./user.service.js";

export const createProfile = async (req, res) => {
    try {
        const authUser = req.user.id;
        const { first_name, last_name, role, contact_number, profile_image } = req.body;

        if(!first_name || !last_name ||!role){
            return res.status(400).json({ error: 'first_name, last_name, and role are required' });
        }

        const allowedRoles = ["customer", "rider"];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        const profile = await createUserProfile(req.supabase, {
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
        const profile = await getUserProfile(req.supabase, user_id);
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
        const profile = await updateUserProfile(req.supabase, user_id, { first_name, last_name, contact_number, profile_image });
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// SETUP USER

export const setupUser = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await setupUserService(
      req.supabase,
      user_id,
      req.body
    );

    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


// CUSTOMER RESGISTER AS STOREOWNER

export const becomeStoreOwner = async (req, res) => {
    try {
        const authUser = req.user.id;

        const profile = await getUserProfile(req.supabase, authUser);

        if (profile.role === "storeowner") {
            return res.status(400).json({ error: "Already a storeowner" });
        }

        const updatedProfile = await updateUserRole(
            req.supabase,
            authUser,
            "storeowner"
        );

        res.json({
            message: "User upgraded to storeowner",
            profile: updatedProfile
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


