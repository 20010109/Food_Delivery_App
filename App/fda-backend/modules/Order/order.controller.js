import * as orderService from "./order.service.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { restaurant_id, items } = req.body;

    const order = await orderService.createOrder(
      userId,
      restaurant_id,
      items
    );

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await orderService.getUserOrders(userId);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const updateStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const { data, error } = await orderService.updateOrderStatus(orderId, status);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};