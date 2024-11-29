import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; //raw cookie header is parsed into js object

const app = express();

//cors middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, //Allows credentials (cookies, HTTP auth, etc.) to be sent
  })
);

app.use(express.json({limit : "16kb"}));//handles json payloads for apis
app.use(express.urlencoded({extended : true, limit : "16kb"}))//handling form submissions
app.use(express.static("public"));//handling static files
app.use(cookieParser());//handling cookies for authentication, session management
export { app };