import express from 'express';
import { loginUser, registerUser, getUserById } from '../controllers/usersController.js';

const router = express.Router();

// Login
router.post('/login', loginUser);

// Registro
router.post('/register', registerUser);

//  usuario por ID
router.get('/:id', getUserById);

export default router;
