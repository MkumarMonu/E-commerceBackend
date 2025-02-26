import express, { urlencoded } from 'express'
import dotenv from 'dotenv'
import dbConnection from './db/dbConnect.js';
import { userRouter } from './routes/user.routes.js';

// Load environment variables from.env file
dotenv.config();
const app = express();

// Middleware

app.use(express.json())


app.use("/api/v1/users", userRouter)
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

dbConnection();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});