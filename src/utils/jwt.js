/* import { TOKEN_SECRET } from "../config.js"; */
const TOKEN_SECRET = process.env.TOKEN_SECRET
import jwt from 'jsonwebtoken';

export async function createAccessToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, TOKEN_SECRET, { expiresIn: "30m"}, (err, token) => {
            if (err) reject(err);
            resolve(token);
        });
    });
    
}
