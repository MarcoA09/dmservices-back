import jwt from 'jsonwebtoken';
/* import { TOKEN_SECRET } from "../config.js"; */

const TOKEN_SECRET = process.env.TOKEN_SECRET
import { createAccessToken } from '../utils/jwt.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import  nodemailer  from 'nodemailer';
import User from "../models/user.model.js";
import Subs from "../models/subscriptor.model.js";
import { admin } from "../firebase.js";
import { sendVerificationEmail } from "../utils/email.js";


export const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const userFound = await User.findOne({ email });

        if (userFound) {
            return res.status(400).json({
                message: ["El usuario ya existe, utilice un correo diferente"],
            });
        }

        const passwordHashed = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: passwordHashed,
            rol: "Cliente",
            phone,
            createdAt: new Date(),
        });

        const userSaved = await newUser.save();

        const userFirebase = await admin.auth().createUser({
            email: email,
            password: password,
            emailVerified: false, 
        });

      
        const actionCodeSettings = {
            url: `https://dmservices-front-b7kt.vercel.app/verify-email?email=${email}`, 
            handleCodeInApp: true, 
        };

        const verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
        await sendVerificationEmail(email, verificationLink);

        console.log("Enlace de verificación:", verificationLink);

        const token = await createAccessToken({
            id: userSaved._id,
        });

        res.cookie("token", token, {
            httpOnly: false,  
            secure: true,  
            sameSite: "none",
        });

        return res.status(201).json({
            id: userSaved._id,
            user: userSaved.name,
            email: userSaved.email,
            phone: userSaved.phone,
            message: ["El usuario fue creado exitosamente. Revisa tu correo para verificarlo."],
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


        export const verifyEmail = async (req, res) => {
            try {
                const { email } = req.body;
        
                const userFirebase = await admin.auth().getUserByEmail(email);
        
                if (!userFirebase.emailVerified) {
                    return res.status(400).json({ message: "Tu correo aún no ha sido verificado en Firebase." });
                }
        
                const updatedUser = await User.findOneAndUpdate(
                    { email },
                    { emailVerified: true },
                    { new: true }
                );
        
                if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado." });
        
                res.json({ success: true, message: "Correo verificado y sincronizado." });
        
            } catch (error) {
                return res.status(500).json({ message: error.message });
            }
        };
        
  export const login = async (req, res) => {
            try {
                const { email, password } = req.body;
    
                const userRecord = await admin.auth().getUserByEmail(email);
                if (!userRecord) {
                    return res.status(400).json({ message: "Usuario no encontrado en Firebase" });
                }
    
                if (!userRecord.emailVerified) {
                    return res.status(403).json({ message: "Debes verificar tu correo antes de iniciar sesión." });
                }
        
                const userFound = await User.findOne({ email });
                if (!userFound) {
                    return res.status(400).json({
                        message: ["El usuario no existe, utilice un correo registrado o registrelo"],
                    });
                }
        
                if (userFound.bloqueado && userFound.bloqueado <= Date.now()) {
                    await User.updateOne({ email }, { $set: { intentos: 0, bloqueado: null } });
                    userFound.intentos = 0;
                    userFound.bloqueado = null;
                }
        
                if (userFound.bloqueado && userFound.bloqueado > Date.now()) {
                    const tiempoRest = Math.ceil((userFound.bloqueado - Date.now()) / 1000);
                    const fecha = new Date().toDateString();
                    const hora = new Date().getHours();
                    const minutos = new Date().getMinutes();
                    const infolog = `Se bloqueó al usuario: ${email} por 3 intentos fallidos a las ${fecha} - ${hora}:${minutos}.\n`;
        
                    try {
                        if (!fs.existsSync("log.txt")) {
                            console.log("El archivo de Log no existe, creándolo...");
                            await fs.promises.writeFile("log.txt", infolog);
                        } else {
                            await fs.promises.appendFile("log.txt", infolog);
                        }
        
                        return res.status(403).json({
                            message: [`Cuenta bloqueada por intentos fallidos, espera ${tiempoRest} segundos o resetea la contraseña.`],
                        });
        
                    } catch (err) {
                        console.log("Error en el inicio de sesión", err);
                        return res.status(500).json({ message: ["Hubo un problema al crear el archivo de log"] });
                    }
                }
        
                const isMatch = await bcrypt.compare(password, userFound.password);
                if (isMatch) {
                    await User.updateOne({ email }, { $set: { intentos: 0, bloqueado: null } });
        
                    const token = await createAccessToken({
                        id: userFound._id,
                        name: userFound.name,
                        rol: userFound.rol,
                        phone: userFound.phone,
                    });
        
                    res.cookie("token", token, {
                        httpOnly: false,
                        secure: true,
                        sameSite: "none",
                    });
        
                    return res.status(201).json({
                        token,
                        id: userFound._id,
                        name: userFound.name,
                        email: userFound.email,
                        rol: userFound.rol,
                        phone: userFound.phone,
                        message: [`Hola ${userFound.name}, has iniciado sesión correctamente`],
                    });
        
                } else {
                    const intentos = (userFound.intentos || 0) + 1;
                    if (intentos >= 3) {
                        const tiempoBloqueo = Date.now() + 1 * 60 * 1000;
                        await User.updateOne({ email }, { $set: { intentos, bloqueado: tiempoBloqueo } });
        
                        return res.status(403).json({
                            message: ["Cuenta bloqueada por intentos fallidos, espera 1 minuto o reinicia la contraseña."],
                        });
                    } else {
                        await User.updateOne({ email }, { $set: { intentos } });
                    }
        
                    return res.status(400).json({ message: ["La contraseña es incorrecta, verifícala e intenta de nuevo."] });
                }
        
            } catch (error) {
                return res.status(500).json({ message: error.message });
            }
        };
        
        


            export const requestPasswordReset = async(req, res) => {
                    const { email } = req.body;
                    try{
                        const userFound = await User.findOne({ email });

                        if (!userFound) {
                            return res.status(404).json({
                                message: ["Correo no registrado"],
                            });
                        }
                        const token = await createAccessToken({
                            id: userFound._id,
                        });

                        const transporter = nodemailer.createTransport({
                            host: "smtp.gmail.com",
                            port: 587,
                            secure: false,
                            auth: {
                                user: process.env.EMAIL_USER,
                                pass: process.env.EMAIL_PASS,
                            },
                        });

                        const resetLink = `https://dmservices-front-b7kt.vercel.app/reset-password/${token}`;

                        await transporter.sendMail({
                            from: '"Soporte" <2025178001@uteq.edu.mx>',
                            to: userFound.email,
                            subject: "Recuperación de contraseña",
                            html: `<p>Por favor, haga clic en el enlace para restablecer su contraseña, si no ha solicitado esto por favor ignore.</p>
                            <a href="${resetLink}">Clic aquí para restablecer su contraseña</a>`,
                        });

                        res.json({ message: "Hemos enviado un correo con el enlace de recuperación." });
                        } catch (error) {
                            res.status(500).json({ message: "Error en el servidor del request" });
                        }
                        }

                    export const resetPassword = async (req, res) => {
                            const { token } = req.params;
                            const { newPassword } = req.body;
                            try {
                                const decoded = jwt.verify(token, TOKEN_SECRET);
                                const userFound = await User.findOne({ _id: decoded.id });

                                if (!userFound) {
                                    return res.status(404).json({
                                        message: ["El usuario no existe"],
                                    });
                                }

                            const hashedPassword = await bcrypt.hash(newPassword, 10);
                            await User.updateOne(
                                { _id: userFound._id },
                                { $set: { password: hashedPassword } }
                            ); 

                                            return res.status(201).json({
                                                message: ["El contraseña actualizada exitosamente"],
                                        });

                                    } catch (error) {
                                        res.status(400).json({ message: "Token inválido o expirado" });
                                }
                                } 

   export const verifyToken = async (req, res) => {
                                    const token = req.headers.authorization?.split(" ")[1];
                                    if (!token) return res.sendStatus(401);
                                
                                    jwt.verify(token, TOKEN_SECRET, async (error, user) => {
                                        if (error) return res.sendStatus(403);
                                
                                    
                                        const userFound = await User.findById(user.id);
                                        if (!userFound) return res.sendStatus(404);
                                
                                    
                                        if (!userFound.emailVerified) {
                                            return res.status(400).json({ message: "Por favor, verifique su correo electrónico." });
                                        }
                                
                                    
                                        res.json({
                                            id: userFound._id,
                                            name: userFound.name,
                                            email: userFound.email,
                                            rol: userFound.rol,
                                            phone: userFound.phone,
                                            emailVerified: userFound.emailVerified, 
                                        });
                                    });
                                };
                                

    
                            export const logout = async (req, res) => {
                                res.cookie("token", "", {
                                httpOnly: false,
                                secure: true, 
                                expires: new Date(0),
                                });
                            
                                return res.status(200).json({ message: "Sesión cerrada correctamente" });
                            };
                            


                            export const requestContactForm = async(req, res) => {
                                const { values } = req.body; 
                                const { name, email, message } = values;
                                try{
                                
                                    const transporter = nodemailer.createTransport({
                                        host: "smtp.gmail.com",
                                        port: 587,
                                        secure: false,
                                        auth: {
                                            user: process.env.EMAIL_USER,
                                            pass: process.env.EMAIL_PASS,
                                        },
                                    });
            
                                    await transporter.sendMail({
                                        from: "2025178001@uteq.edu.mx",
                                        to: '2025178001@uteq.edu.mx',
                                        subject: "Recibiste un Mensaje del Sitio",
                                       text: `Nombre: ${name}\nEmail: ${email}\nMensaje: ${message}`
                                    });
            
                                    res.json({ message: "Su mensaje fue enviado con éxito" });
                                    } catch (error) {
                                        res.status(500).json({ message: "Error en el servidor del request" });
                                    }
                                    }


                                    export const registerSubsRequest = async (req, res) => {
                                        try {
                                            const { email } = req.body;
                                            const subsFound = await Subs.findOne({ email });
                                          
                                            if (subsFound) {
                                                return res.status(400).json({
                                                    message: ["El usuario ya existe, no es necesario suscribirse nuevamente. Gracias"],
                                                });
                                            }

                
                                            const newSubs = new Subs({
                                                email,
                                                createdAt: new Date()
                                            });
                                    
                                            const subsSaved = await newSubs.save();

                                            return res.status(201).json({
                                                id: subsSaved._id,
                                                email: subsSaved.email,
                                                message: ["Ahora recibiras nuestras promociones. Gracias por suscribirte"],
                                          });
                                    
                                            } catch (error) {
                                                return res.status(500).json({ message: error.message });
                                              }
                                            }
