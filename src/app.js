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

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      // Permite conexiones desde cualquier origen si no hay origen (por ejemplo, cuando se está probando localmente)
      return callback(null, true);
    }

    // Verifica si el origen está permitido
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Si el origen no está permitido, devuelve un error
    return callback(new Error('Acceso no permitido por CORS'));
  },
  credentials: true, // Permite cookies y autenticación
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
}));

app.options('*', cors());


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
