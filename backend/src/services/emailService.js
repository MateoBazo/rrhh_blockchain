// file: backend/src/services/emailService.js

/**
 * SERVICIO: Email
 * 
 * Maneja envío de emails transaccionales usando Nodemailer.
 * Soporta Gmail, Outlook, SMTP genérico.
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.inicializar();
  }

  /**
   * Inicializar transporter de Nodemailer
   */
  inicializar() {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };

    // Validar configuración
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('⚠️  Configuración de email incompleta. Emails NO se enviarán.');
      console.warn('   Configura SMTP_USER y SMTP_PASS en .env');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport(emailConfig);
      console.log('✅ Servicio de email inicializado');
    } catch (error) {
      console.error('❌ Error al inicializar servicio de email:', error);
    }
  }

  /**
   * Verificar conexión SMTP
   */
  async verificarConexion() {
    if (!this.transporter) {
      throw new Error('Transporter no inicializado');
    }

    try {
      await this.transporter.verify();
      console.log('✅ Conexión SMTP verificada');
      return true;
    } catch (error) {
      console.error('❌ Error verificando conexión SMTP:', error);
      throw error;
    }
  }

  /**
   * Enviar email de verificación de referencia
   */
  async enviarEmailVerificacion(referencia, token) {
    if (!this.transporter) {
      throw new Error('Servicio de email no configurado');
    }

    const urlVerificacion = `${process.env.FRONTEND_URL}/verificar-referencia/${token}`;
    
    const nombreCandidato = referencia.candidato 
      ? `${referencia.candidato.nombres} ${referencia.candidato.apellido_paterno}` 
      : 'Un candidato';

    const htmlContent = this.generarPlantillaVerificacion({
      nombreReferencia: referencia.nombre_completo,
      nombreCandidato,
      cargo: referencia.cargo || 'una posición',
      empresa: referencia.empresa || 'su organización',
      urlVerificacion,
      expiracionDias: 7
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Sistema RRHH Blockchain'}" <${process.env.SMTP_USER}>`,
      to: referencia.email,
      subject: 'Verificación de Referencia Laboral - Acción Requerida',
      html: htmlContent,
      text: this.generarTextoPlano({
        nombreReferencia: referencia.nombre_completo,
        nombreCandidato,
        urlVerificacion
      })
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email de verificación enviado a ${referencia.email}`);
      console.log('   Message ID:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      throw error;
    }
  }

  /**
   * Generar plantilla HTML para email de verificación
   */
  generarPlantillaVerificacion(data) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación de Referencia</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 20px;
        }
        .message {
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .info-box {
            background-color: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
        }
        .info-box p {
            margin: 8px 0;
            color: #2d3748;
        }
        .info-box strong {
            color: #1a202c;
        }
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        .button {
            display: inline-block;
            background-color: #667eea;
            color: white !important;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #5568d3;
        }
        .warning {
            background-color: #fff5f5;
            border-left: 4px solid #f56565;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #742a2a;
            font-size: 14px;
        }
        .footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            color: #718096;
            font-size: 14px;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .expiration {
            color: #e53e3e;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Verificación de Referencia Laboral</h1>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hola ${data.nombreReferencia},
            </div>
            
            <div class="message">
                <p><strong>${data.nombreCandidato}</strong> te ha agregado como referencia laboral/académica en nuestro sistema de gestión de recursos humanos.</p>
                
                <p>Para confirmar que das tu consentimiento para ser contactado/a por empresas reclutadoras y validar la autenticidad de esta referencia, necesitamos que verifiques tu información haciendo clic en el botón de abajo.</p>
            </div>

            <div class="info-box">
                <p><strong>📋 Información de la referencia:</strong></p>
                <p><strong>Candidato:</strong> ${data.nombreCandidato}</p>
                <p><strong>Tu cargo declarado:</strong> ${data.cargo}</p>
                <p><strong>Empresa/Institución:</strong> ${data.empresa}</p>
            </div>

            <div class="button-container">
                <a href="${data.urlVerificacion}" class="button">
                    ✅ Verificar y Dar Consentimiento
                </a>
            </div>

            <div class="warning">
                ⚠️ <strong>Importante:</strong> Si no reconoces al candidato mencionado o no deseas ser contactado/a, simplemente ignora este email. No verificar la referencia equivale a no dar tu consentimiento.
            </div>

            <p class="expiration">
                ⏰ Este link expirará en ${data.expiracionDias} días
            </p>

            <div class="message" style="font-size: 14px; color: #718096; margin-top: 30px;">
                <p><strong>¿Qué significa verificar?</strong></p>
                <ul style="padding-left: 20px;">
                    <li>Confirmas que conoces al candidato</li>
                    <li>Autorizas a empresas a contactarte para referencias</li>
                    <li>Validas la información laboral proporcionada</li>
                    <li>La verificación queda registrada de forma inmutable</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p><strong>Sistema RRHH Blockchain</strong></p>
            <p>Este es un email automático, por favor no responder.</p>
            <p>Si tienes preguntas, contacta a <a href="mailto:soporte@rrhh-blockchain.com">soporte@rrhh-blockchain.com</a></p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generar versión texto plano del email
   */
  generarTextoPlano(data) {
    return `
Verificación de Referencia Laboral

Hola ${data.nombreReferencia},

${data.nombreCandidato} te ha agregado como referencia laboral en nuestro sistema.

Para verificar tu consentimiento, visita este link:
${data.urlVerificacion}

Este link expirará en 7 días.

Si no reconoces esta solicitud, simplemente ignora este email.

---
Sistema RRHH Blockchain
Este es un email automático, por favor no responder.
    `.trim();
  }
}

// Exportar instancia única (Singleton)
module.exports = new EmailService();