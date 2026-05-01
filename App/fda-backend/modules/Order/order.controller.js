import {
  createUserOrder,
  getUserOrders,
  getUserOrderById,
  updateUserOrderStatus,
  deleteUserOrder,
} from "./order.service.js";

export const createOrder = async (req, res) => {
  try {
    const user_id = req.user.id;

    const {
      restaurant_id,
      items,
      delivery_fee = 0,
      tip = 0,
    } = req.body;

    if (!restaurant_id || !items) {
      return res.status(400).json({
        error: "restaurant_id and items are required",
      });
    }

    const order = await createUserOrder(req.supabase, {
      user_id,
      restaurant_id,
      items,
      delivery_fee,
      tip,
    });

    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const user_id = req.user.id;
    const orders = await getUserOrders(req.supabase, user_id);
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const user_id = req.user.id;
    const order_id = req.params.id;

    const order = await getUserOrderById(req.supabase, order_id, user_id);

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const user_id = req.user.id;
    const order_id = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    const order = await updateUserOrderStatus(
      req.supabase,
      order_id,
      user_id,
      status
    );

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const user_id = req.user.id;
    const order_id = req.params.id;

    const cancelledOrder = await deleteUserOrder(
      req.supabase,
      order_id,
      user_id
    );

    return res.status(200).json({
      message: "Order cancelled successfully.",
      order: cancelledOrder,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};