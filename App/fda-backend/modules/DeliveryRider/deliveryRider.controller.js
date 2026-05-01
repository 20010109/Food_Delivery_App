import { 
  getRiderDeliveries, 
  getRiderDeliveryHistory, 
  acceptDelivery as acceptDeliveryService,
  updateDeliveryStatus as updateDeliveryStatusService,
  getDeliveryById
} from './deliveryRider.service.js';

// Get rider's current active deliveries
export const getRiderCurrentDeliveries = async (req, res) => {
  try {
    const rider_id = req.user.id;
    const deliveries = await getRiderDeliveries(req.supabase, rider_id);
    return res.status(200).json(deliveries);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get rider's delivery history
export const getRiderHistory = async (req, res) => {
  try {
    const rider_id = req.user.id;
    const history = await getRiderDeliveryHistory(req.supabase, rider_id);
    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Accept a delivery
export const acceptDelivery = async (req, res) => {
  try {
    const rider_id = req.user.id;
    const { delivery_id } = req.body;

    if (!delivery_id) {
      return res.status(400).json({ error: "delivery_id is required" });
    }

    const delivery = await acceptDeliveryService(req.supabase, delivery_id, rider_id);
    return res.status(200).json(delivery);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update delivery status
export const updateDeliveryStatus = async (req, res) => {
  try {
    const rider_id = req.user.id;
    const { delivery_id, status } = req.body;

    if (!delivery_id || !status) {
      return res.status(400).json({ error: "delivery_id and status are required" });
    }

    const delivery = await updateDeliveryStatusService(
      req.supabase, 
      delivery_id, 
      rider_id, 
      status
    );
    return res.status(200).json(delivery);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get delivery details by ID
export const getDeliveryDetails = async (req, res) => {
  try {
    const rider_id = req.user.id;
    const delivery_id = req.params.id;

    if (!delivery_id) {
      return res.status(400).json({ error: "delivery_id is required" });
    }

    const delivery = await getDeliveryById(req.supabase, delivery_id, rider_id);
    
    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    return res.status(200).json(delivery);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAvailableDeliveriesController = async (req, res) => {
  try {
    const deliveries = await getAvailableDeliveries(req.supabase);
    return res.status(200).json(deliveries);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};