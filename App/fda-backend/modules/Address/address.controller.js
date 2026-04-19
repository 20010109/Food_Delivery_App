import { createAddress, getAddress, updateAddress, deleteAddress } from "./address.service.js";


export const createUserAddress = async (req, res) => {
    try {
        const { address_line, longitude, latitude } = req.body;
        const user_id = req.user.id;
        if(!address_line) {
            return res.status(400).json({ error: "All fields are required" });
        }
        
        const newAddress = await createAddress(req.supabase, { 
            user_id, 
            address_line, 
            longitude, 
            latitude 
        });

        return res.status(201).json(newAddress);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getUserAddress = async (req, res) => {
    try {
        const user_id = req.user.id;
        const addresses = await getAddress(req.supabase, user_id);
        res.status(200).json(addresses);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const updateUserAddress = async (req, res) => {
    try {
        const user_id = req.user.id;
        const address_id = req.params.id;
        const { address_line, longitude, latitude } = req.body;

        if (address_line == null && longitude == null && latitude == null) {
            return res.status(400).json({ error: "No fields to update" });
        }
        
        const userAddresses = await getAddress(req.supabase, user_id);
        const ownsAddress = userAddresses.some((a) => String(a.address_id) === String(address_id));

        if (!ownsAddress) {
            return res.status(404).json({ error: "Forbidden" });
        }
        
        const updatedAddress = await updateAddress(req.supabase, address_id, { 
            address_line, 
            longitude, 
            latitude 
        });
        res.json(updatedAddress);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const deleteUserAddress = async (req, res) => {
    try {
        const user_id = req.user.id;
        const address_id = req.params.id;

        const userAddresses = await getAddress(req.supabase, user_id);
        const ownsAddress = userAddresses.some((a) => String(a.address_id) === String(address_id));

        if (!ownsAddress) {
            return res.status(403).json({ error: "Forbidden" });
        }


        await deleteAddress(req.supabase, address_id);
        res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};