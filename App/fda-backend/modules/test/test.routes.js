import express from 'express';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

router.get('/test-db', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export default router;