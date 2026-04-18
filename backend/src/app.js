// /Users/homefolder/Desktop/Projects/gitproject/HackFocus-App/backend/src/app.js

import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv";
dotenv.config();

const app = express()

console.log("CORS ORIGIN : " , process.env.CORS_ORIGIN);


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true // should be true , false bec of testing purposes
}))

app.get("/", (req, res) => {
    res.send("Backend server is up and running!");
});

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import todoRouter from './routes/todo.routes.js'
import pomodoroRouter from './routes/pomodoro.routes.js'

app.use("/api/v1/users", userRouter)
app.use("/api/videos", videoRouter)
app.use("/api/v1/todos", todoRouter)
app.use("/api/v1/pomodoro",pomodoroRouter)


export { app }