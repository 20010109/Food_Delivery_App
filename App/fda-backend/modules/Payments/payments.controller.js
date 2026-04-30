import { processPayment } from './payments.service.js';

export const checkout = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { restaurant_id, items, payment_method } = req.body;

        if (!restaurant_id || !items || !payment_method) {
            return res.status(400).json({ error: 'restaurant_id, items, and payment_method are required' });
        }

        const result = await processPayment(req.supabase, { user_id, restaurant_id, items, payment_method });
        return res.status(201).json(result);
    } catch (error) {
        if (
            error.message === "Insufficient wallet balance." ||
            error.message.startsWith("Invalid payment method")
        ) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
};
        