import mongoose from "mongoose";
import { DB_NAME } from "../contants.js";
import dotenv from "dotenv";
import express from "express";

const app = express();
const connectDB = async () => {
  dotenv.config();
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB Connected to ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
