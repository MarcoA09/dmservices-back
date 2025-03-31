import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
/* import {FRONTEND_URL} from './config.js'; 
import {PORT} from './config.js';*/
const PORT = process.env.PORT
const FRONTEND_URL = process.env.FRONTEND_URL;
import { connectDB } from './conexion.js'

import WebSocket, { WebSocketServer } from 'ws';


const wss = new WebSocketServer({ port: 8080 });


import authRoutes from './routes/auth.routes.js';
import reservedRoutes from './routes/reserved.routes.js';
 
/* const FRONTEND_URL = process.env.FRONTEND_URL;
const FRONTEND_URL_WQQJ = process.env.FRONTEND_URL_WQQJ;
const FRONTEND_I24M = process.env.FRONTEND_URL_I24M; */

const app = express();

/* const allowedOrigins = [
  'https://ev-r-task-manager-front.vercel.app',
  'https://ev-r-task-manager-front-wqqj.vercel.app',
  'https://ev-r-task-manager-front-i24m.vercel.app', 
]
 */

app.use(cors({
  credentials: true, 
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);  
    }
    return callback(new Error('CORS policy does not allow access from this origin'));
  },
}));


app.options('*', cors());

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use("/api/", authRoutes)
app.use("/api/", reservedRoutes)

wss.on("connection", (ws) => {
    console.log("Cliente conectado al WebSocket");
    ws.on("message", (mensaje) => {
      const data = JSON.parse(mensaje);
  
      if (data.tipo === "nueva-reserva") {
        wss.clients.forEach((cliente) => {
          if (cliente.readyState === WebSocket.OPEN) {
            cliente.send(JSON.stringify({ tipo: "actualizar-calendario" }));
          }
        });
      }
    });
  
    ws.on("close", () => {
      console.log("Cliente desconectado del WebSocket");
    });
  });

async function main() {
    try {
        await connectDB();
        app.listen(PORT);
        console.log(`Servidor activo en puerto: ${PORT}`);
    } catch (error) {
        console.log(error);
    }
}

main()
