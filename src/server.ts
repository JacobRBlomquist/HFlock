import * as express from 'express';
import * as WebSocket from 'ws';
import {webRouter} from "./webRoutes";

const app = express();
const port = process.env.PORT || 8999;



//initialize a simple http server
const server = app.listen(port,()=>{
    console.log(`Server started on port ${port}`);
}) 

//WEBSERVER
app.use("/",webRouter);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
}

function createMessage(content: string, isBroadcast = false, sender = 'NS'): string {
    return JSON.stringify(new Message(content, isBroadcast, sender));
}

export class Message {
    constructor(
        public content: string,
        public isBroadcast = false,
        public sender: string
    ) { }
}


wss.on('connection', (ws: WebSocket,request) => {

    const extWs = ws as ExtWebSocket;
    console.log(request.socket.remoteAddress,request.socket.remotePort);
    extWs.isAlive = true;

    ws.on('pong', () => {
        extWs.isAlive = true;
    });

    //connection is up, let's add a simple simple event
    ws.on('message', (msg: string) => {

        let message:Message;

        try{
        message = JSON.parse(msg) as Message;

        }catch (e){
            ws.send(JSON.stringify({type:"Error",message:"Malformed request"}))
            return;
        }

        setTimeout(() => {
            if (message.isBroadcast) {

                //send back the message to the other clients
                wss.clients
                    .forEach(client => {
                        if (client != ws) {
                            client.send(createMessage(message.content, true, message.sender));
                        }
                    });

            }

            ws.send(createMessage(`You sent -> ${message.content}`, message.isBroadcast));

        }, 10);

    });

    //send immediatly a feedback to the incoming connection    
    ws.send(createMessage('Hi there, I am a WebSocket server'));

    ws.on('error', (err) => {
        console.warn(`Client disconnected - reason: ${err}`);
    })
});

setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {

        const extWs = ws as ExtWebSocket;
        if (!extWs.isAlive) {
            return ws.terminate();
        }

        extWs.isAlive = false;
        ws.ping(null, undefined);
    });
}, 5000);
