import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './conexion.js';


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
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Bloqueado por CORS: ${origin}`); // Log para depurar
      callback(new Error("Acceso no permitido por CORS"));
    }
  }
}));

app.options('*', cors());


app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());


import authRoutes from './routes/auth.routes.js';
import reservedRoutes from './routes/reserved.routes.js';
app.use("/api/", authRoutes);
app.use("/api/", reservedRoutes);

import { createServer } from 'http';
const server = createServer(app);  
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Cliente conectado al WebSocket");

  // Manejo de mensajes del WebSocket
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
    console.error("Error al conectar a la base de datos", error);
  }
}

main();
