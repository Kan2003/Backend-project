import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({
    limit: "16kb",
})); // to telling backend that data coming from client will be in json format
app.use(express.urlencoded({ extended: true })); // to tell backend that data coming from client will be in urlencoded format

app.use(express.static("public")); // to serve static files from public folder

app.use(cookieParser()); 

// routes 
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import likeRouter from "./routes/like.routes.js";
import healthRouter from "./routes/healthcheck.routes.js";
import SubscriberRouter from './routes/subscription.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
import homeRouter from './routes/home.routes.js'
// routes decleration
app.use('/api/v1/users', userRouter);

app.use("/api/v1/videos", videoRouter)

app.use("/api/v1/comments", commentRouter)

app.use("/api/v1/tweets", tweetRouter)

app.use('/api/v1/likes' , likeRouter)

app.use('/api/v1/health' , healthRouter)

app.use('/api/v1/subscribe' , SubscriberRouter)

app.use('/api/v1/playlist' , playlistRouter)

app.use('/api/v1/dashboard' , dashboardRouter)

app.use('/api/v1/home' , homeRouter)

export {app};