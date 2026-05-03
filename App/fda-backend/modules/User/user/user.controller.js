import { createUserProfile, getUserProfile, updateUserProfile, updateUserRole, setupUserService, getWalletBalance, topUpWallet, deductFromWallet, getGcashNumber, linkGcashNumber, unlinkGcashNumber, getSavedCards, addSavedCard, deleteSavedCard } from "./user.service.js";

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

export const getWallet = async (req, res) => {
    try {
        const user_id = req.user.id;
        const data = await getWalletBalance(req.supabase, user_id);
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addWalletFunds = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { amount } = req.body;
        if (!amount) return res.status(400).json({ error: 'amount is required' });
        const data = await topUpWallet(req.supabase, user_id, amount);
        return res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deductWalletFunds = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { amount } = req.body;
        if (!amount) return res.status(400).json({ error: 'amount is required' });
        const data = await deductFromWallet(req.supabase, user_id, amount);
        return res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


export const getGcash = async(req, res) => {
    try {
        const user_id = req.user.id;
        const data = await getGcashNumber(req.supabase, user_id);
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const linkGcash = async(req, res) => {
    try {
        const user_id = req.user.id;
        const { gcash_number } = req.body;
        if (!gcash_number) return res.status(400).json({ error: 'gcash_number is required' });
        const data = await linkGcashNumber(req.supabase, user_id, gcash_number);
        return res.status(200).json(data);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const unlinkGcash = async(req, res) => {
    try {
        const user_id = req.user.id;
        const data = await unlinkGcashNumber(req.supabase, user_id);
        return res.status(200).json(data);
    }
    catch(error){
        res.status(400).json({ error: error.message });
    }
};

export const getCard = async (req, res) => {
    try {
        const user_id = req.user.id;
        const data = await getSavedCards(req.supabase, user_id);
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addCard = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { cardholder_name, card_number, expiry_month, expiry_year } = req.body;
        if (!cardholder_name || !card_number || !expiry_month || !expiry_year) {
            return res.status(400).json({ error: "cardholder_name, card_number, expiry_month, and expiry_year are required" });
        }
        const data = await addSavedCard(req.supabase, user_id, { cardholder_name, card_number, expiry_month, expiry_year });
        return res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteCard = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { card_id } = req.params;
        await deleteSavedCard(req.supabase, user_id, card_id);
        return res.status(200).json({ message: "Card deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

