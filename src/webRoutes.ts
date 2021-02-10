import * as express from 'express';

export const webRouter = express.Router();

webRouter.get("/",(req,res)=>{
    res.json({status:"App is running"});
})

