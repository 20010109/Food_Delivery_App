import express from 'express';
import { createUserAddress, getUserAddress, updateUserAddress, deleteUserAddress  } from './address.controller.js';
import { authenticate } from '../../middleware/authMiddleware.js';

const router = express.Router()

router.post('/', authenticate, createUserAddress)
router.get('/', authenticate, getUserAddress)
router.put('/:id', authenticate, updateUserAddress)
router.delete('/:id', authenticate, deleteUserAddress)

export default router;
