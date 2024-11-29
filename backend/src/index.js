import dotenv from 'dotenv'//for loading env variables
import connectDB from './database/index.js'
import { app as application } from './app.js' //middleware conflict was happening when exporting just app

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    application.listen(process.env.PORT || 8000 ,  () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("Mongodb connection failed !!!", err);
})