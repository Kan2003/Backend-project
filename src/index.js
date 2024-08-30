import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config();
connectDB()
.then(() => {
    app.listen(process.env.PORT|| 8000, () => {
        console.log(`server is run on port ${process.env.PORT}`)
    })
})
.catch((err) => console.error("mongodb connect failed !!",err));





