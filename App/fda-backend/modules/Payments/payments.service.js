import { createUserOrder } from "../Order/order.service.js";

const ALLOWED_METHODS = ['cash', 'gcash', 'card', 'wallet'];

export const processPayment = async (supabase, { user_id, restaurant_id, items, payment_method }) => {
    if (!ALLOWED_METHODS.includes(payment_method)) {
        throw new Error(`Invalid payment method. Allowed: ${ALLOWED_METHODS.join(', ')}`);
    }

    // create order — total_price is computed inside createUserOrder
    const { order, items: orderItems } = await createUserOrder(supabase, { user_id, restaurant_id, items });

    // wallet: check balance and deduct
    if (payment_method === 'wallet') {
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('wallet_balance')
            .eq('user_id', user_id)
            .single();

        if (profileError) {
            await supabase.from('orders').delete().eq('order_id', order.order_id);
            throw profileError;
        }

        if (Number(profile.wallet_balance) < order.total_price) {
            await supabase.from('orders').delete().eq('order_id', order.order_id);
            throw new Error("Insufficient wallet balance.");
        }

        const { error: deductError } = await supabase
            .from('user_profiles')
            .update({ wallet_balance: Number(profile.wallet_balance) - order.total_price })
            .eq('user_id', user_id);

        if (deductError) {
            await supabase.from('orders').delete().eq('order_id', order.order_id);
            throw deductError;
        }
    }

    // record payment
    const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
            order_id: order.order_id,
            amount: order.total_price,
            method: payment_method,
            status: 'success'
        })
        .select()
        .single();

    if (paymentError) {
        await supabase.from('orders').delete().eq('order_id', order.order_id);
        throw paymentError;
    }

    return { order, items: orderItems, payment };
};