import express, { urlencoded } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import dbConnection from './db/dbConnect.js';
import { userRouter } from './routes/user.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import cookieParser from 'cookie-parser'

// Load environment variables from.env file
dotenv.config();
const app = express();
app.use(cors());
// Middleware

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cookieParser());

app.use("/api/v1/users", userRouter)
app.use("/api/v1/admin", adminRouter)
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

dbConnection();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});