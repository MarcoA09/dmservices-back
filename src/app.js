import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './conexion.js';
import authRoutes from './routes/auth.routes.js';
import reservedRoutes from './routes/reserved.routes.js';

import WebSocket, { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL; 
const FRONTEND_URL_WQQJ = process.env.FRONTEND_URL_WQQJ;
const FRONTEND_URL_I24M = process.env.FRONTEND_URL_I24M;

const app = express();

const allowedOrigins = [
  'https://dmservices-front.vercel.app',
  'https://dmservices-front-wqqj.vercel.app',
  'https://dmservices-frontt-i24m.vercel.app',
  'https://dmservices-frontt-330b146c0-marcoas-projects-b6ead9da.vercel.app',
];
 
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

app.use("/api/", authRoutes);
app.use("/api/", reservedRoutes);


import { createServer } from 'http';
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


export default app;
