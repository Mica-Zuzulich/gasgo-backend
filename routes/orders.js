import express from 'express';
import { getOrders, createOrder, cancelOrder } from '../controllers/ordersController.js';

const router = express.Router();

router.get('/', getOrders);
router.post('/', createOrder);
router.patch('/:orderId', cancelOrder);

export default router;
