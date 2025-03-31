import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './conexion.js';
import authRoutes from './routes/auth.routes.js';
import reservedRoutes from './routes/reserved.routes.js';

import WebSocket, { WebSocketServer } from 'ws';



const app = express();

const allowedOrigins = [
  'https://dmservices-front-b7kt.vercel.app',
  'https://dmservices-front.vercel.app',
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  // Si es una solicitud OPTIONS, responder con éxito antes de continuar.
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/", authRoutes);
app.use("/api/", reservedRoutes);

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

export default app;


export default app;
