import connectDB from "./db/index.js";
import dotenv from "dotenv";
import express from "express";

const app = express();
dotenv.config();
connectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`server is run on port ${process.env.PORT}`)
    })
})
.catch((err) => console.error("mongodb connect failed !!",err));





