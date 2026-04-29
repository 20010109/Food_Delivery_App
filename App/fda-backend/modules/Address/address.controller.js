import { createAddress, getAddress, updateAddress, deleteAddress, setDefaultAddressService } from "./address.service.js";


export const createUserAddress = async (req, res) => {
    try {
      const {
        house_no,
        street,
        barangay,
        city,
        province,
        postal_code,
        country,
        is_default,
      } = req.body;
  
      const user_id = req.user.id;
  
      if (!street || !city) {
        return res.status(400).json({ error: "Street and City are required" });
      }
  
      const newAddress = await createAddress(req.supabase, {
        user_id,
        house_no,
        street,
        barangay,
        city,
        province,
        postal_code,
        country,
        is_default,
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
  
      return res.status(200).json(addresses);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  export const updateUserAddress = async (req, res) => {
    try {
      const user_id = req.user.id;
      const address_id = req.params.id;
  
      const {
        house_no,
        street,
        barangay,
        city,
        province,
        postal_code,
        country,
        is_default,
      } = req.body;
  
      if (
        !house_no &&
        !street &&
        !barangay &&
        !city &&
        !province &&
        !postal_code &&
        country == null &&
        is_default == null
      ) {
        return res.status(400).json({ error: "No fields to update" });
      }
  
      // Better ownership check (DB-level filter instead of loading all)
      const addresses = await getAddress(req.supabase, user_id);
      const ownsAddress = addresses.find(
        (a) => String(a.address_id) === String(address_id)
      );
  
      if (!ownsAddress) {
        return res.status(403).json({ error: "Forbidden" });
      }
  
      const updatedAddress = await updateAddress(
        req.supabase,
        address_id,
        {
          house_no,
          street,
          barangay,
          city,
          province,
          postal_code,
          country,
          is_default,
        }
      );
  
      return res.json(updatedAddress);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  export const deleteUserAddress = async (req, res) => {
    try {
      const user_id = req.user.id;
      const address_id = req.params.id;
  
      const addresses = await getAddress(req.supabase, user_id);
      const ownsAddress = addresses.find(
        (a) => String(a.address_id) === String(address_id)
      );
  
      if (!ownsAddress) {
        return res.status(403).json({ error: "Forbidden" });
      }
  
      await deleteAddress(req.supabase, address_id);
  
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };


  // Change is_default

  export const setDefaultAddress = async (req, res) => {
    try {
      const userId = req.user.id;
      const addressId = req.params.id;
  
      const result = await setDefaultAddressService(req.supabase, {
        userId,
        addressId,
      });
  
      return res.status(200).json(result);
    } catch (err) {
      console.error("setDefaultAddress error:", err.message);
  
      return res.status(400).json({
        error: err.message || "Failed to set default address",
      });
    }
  };