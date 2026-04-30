import { createUserOrder, getUserOrders, getUserOrderById, updateUserOrderStatus, deleteUserOrder } from "./order.service.js";

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

export const updateOrderStatus = async (req, res) => {
    try {
        const user_id = req.user.id;
        const order_id = req.params.id;
        const { status } = req.body;

        if(!status){
            return res.status(400).json({ error: 'status is required' });
        }
        
        const order = await updateUserOrderStatus(req.supabase, order_id, user_id, status);
        return res.status(200).json(order);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const user_id = req.user.id;
        const order_id = req.params.id;
        await deleteUserOrder(req.supabase, order_id, user_id);
        return res.status(200).send('Order cancelled successfully');
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};