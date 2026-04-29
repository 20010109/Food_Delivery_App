export const createAddress = async (
    supabase,
    {
      user_id,
      house_no,
      street,
      barangay,
      city,
      province,
      postal_code,
      country = "Philippines",
      is_default = false
    }
  ) => {
    const { data, error } = await supabase
      .from("addresses")
      .insert([
        {
          user_id,
          house_no,
          street,
          barangay,
          city,
          province,
          postal_code,
          country,
          is_default
        }
      ])
      .select()
      .single();
  
    if (error) throw error;
    return data;
  };

  export const getAddress = async (supabase, user_id) => {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user_id);
  
    if (error) throw error;
    return data;
  };

  export const updateAddress = async (supabase, address_id, payload) => {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined)
    );
  
    const { data, error } = await supabase
      .from("addresses")
      .update(cleanPayload)
      .eq("address_id", address_id)
      .select()
      .single();
  
    if (error) throw error;
    return data;
  };

  export const deleteAddress = async (supabase, address_id) => {
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("address_id", address_id);
  
    if (error) throw error;
    return { message: "Address deleted successfully" };
  };

// Change is_default

export const setDefaultAddressService = async (
    supabase,
    { userId, addressId }
  ) => {
    // 1. Verify ownership
    const { data: address, error: fetchError } = await supabase
      .from("addresses")
      .select("address_id")
      .eq("address_id", addressId)
      .eq("user_id", userId)
      .single();
  
    if (fetchError || !address) {
      throw new Error("Address not found");
    }
  
    // 2. Unset all user's addresses
    const { error: unsetError } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);
  
    if (unsetError) {
      throw new Error(unsetError.message);
    }
  
    // 3. Set selected as default
    const { error: setError } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("address_id", addressId)
      .eq("user_id", userId);
  
    if (setError) {
      throw new Error(setError.message);
    }
  
    return {
      success: true,
      message: "Default address updated successfully",
    };
  };