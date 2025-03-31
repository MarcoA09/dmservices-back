import app from './app.js';
import { connectDB } from "./conexion.js";

const PORT = process.env.PORT
/* import { PORT } from "./config.js"; */

async function main() {
    try {
      await connectDB();
      app.listen(PORT);
      console.log(`Servidor ejecutando en puerto: ${PORT}`);
    } catch (error) {
      console.error(error);
    }
  }
  
  main();
