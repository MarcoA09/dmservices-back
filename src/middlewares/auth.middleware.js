import jwt from "jsonwebtoken";
/* import { TOKEN_SECRET } from "../config.js"; */

const TOKEN_SECRET = process.env.TOKEN_SECRET

export const auth = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token)
      return res
        .status(401)
        .json({ message: "No hay un token, acceso denegado" });
    jwt.verify(token, TOKEN_SECRET, (error, user) => {
      if (error) {
        return res.status(401).json({ message: "El token no es valido o a expirado" });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}; 
