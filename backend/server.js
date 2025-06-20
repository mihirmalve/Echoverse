import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import Routes from './routes.js'; 
import connectDB from './database.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
const PORT = process.env.PORT || 5500;

app.use(cookieParser());
const corsOptions = {
  credentials: true,
  origin: 'http://localhost:3000', 
  
};
app.use('/storage',express.static('storage'));
app.use(cors(corsOptions)); // Enable CORS for the specified origin
app.use(express.json({ limit: '50mb' }));

connectDB(); // Connect to MongoDB

app.use( Routes);
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));    

