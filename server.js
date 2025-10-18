import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';
import usersRoutes from './routes/users.js';

dotenv.config();
const app = express();
const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:19006',     // Expo Dev Tools
  'exp://192.168.0.*:19000',    // Expo en red local
  'http://192.168.0.*:19006',   // Alternativa Expo
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes); 

app.get('/', (req, res) => {
  res.send('API Gasgo funcionando 🔥');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));