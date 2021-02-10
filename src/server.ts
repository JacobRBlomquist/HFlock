import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as net from 'net';

const app = express();
const router = express.Router();
const port = process.env.PORT || 8999;


//initialize a simple http server
const server = app.listen(port,()=>{
    console.log(`Server started on port ${port}`);
}) 

//WEBSERVER
router.get("/",(req,res)=>{
    res.json({status:"App is running"});
})

app.use("/",router);

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

wss.on('connection', (ws: WebSocket) => {

    const extWs = ws as ExtWebSocket;

    extWs.isAlive = true;

    ws.on('pong', () => {
        console.log("PONG")
        extWs.isAlive = true;
    });

    //connection is up, let's add a simple simple event
    ws.on('message', (msg: string) => {

        const message = JSON.parse(msg) as Message;

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
    console.log("CALLBAK");
    wss.clients.forEach((ws: WebSocket) => {

        const extWs = ws as ExtWebSocket;
        console.log("CUR:",extWs.isAlive);
        if (!extWs.isAlive) {
            console.log(`Client disconnected.`);
            return ws.terminate();
        }

        extWs.isAlive = false;
        ws.ping(null, undefined);
    });
}, 5000);
