import * as express from 'express';
import * as http from 'http';
import * as net from 'net'
import * as WebSocket from 'ws';

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({server});

wss.on('connection',(ws:WebSocket)=>{
    ws.on('message',(message:string)=>{
        console.log("Received %s",message);
        ws.send(`Hello, you sent -> ${message}`);
    });

    //immediate feedback
    ws.send('Hi there, I am a websocket server');
});

server.listen(process.env.PORT || 8999,()=>{
    console.log(`Server started on port ${(server.address() as net.AddressInfo).port} :)`);
});
