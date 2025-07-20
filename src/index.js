// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env"
})


connectDB()









// import express from 'express';
// const app = express()

// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("ERR",(error)=>{
//             console.log("Error: ",error);
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`APP IS ACTIVE ON PORT: ${process.env.PORT}`);
            
//         })
//     } catch (error) {
//         console.error("ERROR:",error)
//         throw error
//     }
// })()