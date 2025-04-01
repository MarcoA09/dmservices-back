import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, verificationLink) => {
  try {
   
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"DM Eventos" <${"2025178001@uteq.edu.mx"}>`,
      to: email,
      subject: "Verifica tu cuenta",
      html: `
        <h3>Hola,</h3>
        <p>Gracias por registrarte en nuestro sitio. Para verificar tu correo, haz clic en el siguiente enlace:</p>
        <a href="${verificationLink}" target="_blank">Verificar mi correo</a>
        <p>Si no solicitaste esto, ignora este mensaje.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo de verificación enviado a:", email);
  } catch (error) {
    console.error("Error enviando correo:", error);
    throw new Error("No se pudo enviar el correo de verificación");
  }
};
