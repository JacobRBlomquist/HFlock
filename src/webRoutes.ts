import * as express from 'express';

export const webRouter = express.Router();

webRouter.get("/",(req,res)=>{
    res.status(200).sendFile("./public/index.html",{root:__dirname});
})

