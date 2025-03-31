import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './conexion.js';
import authRoutes from './routes/auth.routes.js';
import reservedRoutes from './routes/reserved.routes.js';
const PORT = process.env.PORT;
import WebSocket, { WebSocketServer } from 'ws';

const FRONTEND_URL = process.env.FRONTEND_URL;
const FRONTEND_URL_WQQJ = process.env.FRONTEND_URL_WQQJ;
const FRONTEND_I24M = process.env.FRONTEND_URL_I24M;

const allowedOrigins = [
  'https://dmservices-front-b7kt.vercel.app',
  'https://dmservices-front.vercel.app',
];
 

const app = express();

app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Cors problem'));
    }
}));

app.options('*', cors());

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());


app.use("/api/", authRoutes)
app.use("/api/", reservedRoutes)

import { createServer } from "http";
const server = createServer(app);
const wss = new WebSocketServer({ server });

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
    server.listen(PORT, () => {
      console.log(`Servidor activo en puerto: ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main()








 










