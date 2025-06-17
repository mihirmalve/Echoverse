import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import Routes from './routes.js'; 
import connectDB from './database.js';
const app = express();
const PORT = process.env.PORT || 5500;
app.use(express.json());

connectDB(); // Connect to MongoDB

app.use( Routes);
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));    

