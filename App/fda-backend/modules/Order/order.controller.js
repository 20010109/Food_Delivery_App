import { createUserOrder, getUserOrders, getUserOrderById, deleteUserOrder } from "./order.service.js";

export const createOrder = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { restaurant_id, items, total_price} = req.body;
        if(!restaurant_id || !items || !total_price){
            return res.status(400).json({ error: 'restaurant_id, items, and total_price are required' });
        }

        const order = await createUserOrder(req.supabase, { user_id, restaurant_id, items, total_price });
        return res.status(201).json(order);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const user_id = req.user.id;
        const orders = await getUserOrders(req.supabase, user_id);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

export const cancelOrder = async (req, res) => {
    try {
        const user_id = req.user.id;
        const order_id = req.params.id;
        await deleteUserOrder(req.supabase, order_id, user_id);
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};