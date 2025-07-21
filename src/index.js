// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import express from 'express';
const app = express();

dotenv.config({
    path: "./env"
})

var p = process.env.PORT
var def = 8000

connectDB()
.then(()=>{
    app.on("ERR",(error)=>{
            console.log("Error: ",error);
            throw error
        })
    app.listen(p || def,()=>{
        console.log(`LISTENING AT PORT: ${p}`);
    })    
})
.catch((error)=>{
    console.log(`Connection Failed: ${error}`);
    
})









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