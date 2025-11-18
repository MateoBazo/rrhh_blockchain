// file: backend/src/services/emailService.js

/**
 * SERVICIO: Email
 * 
 * Maneja envío de emails transaccionales usando Nodemailer.
 * Soporta Gmail, Outlook, SMTP genérico.
 * 
 * S008.2: Verificación de referencias
 * S008.3: Notificaciones de consulta empresa
 * S009.7: Notificaciones postulaciones
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
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };

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
   * S008.2
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
   * Enviar notificación a referencia cuando empresa consulta
   * S008.3
   */
  async enviarEmailNotificacionAcceso(data) {
    if (!this.transporter) {
      throw new Error('Servicio de email no configurado');
    }

    const {
      nombreReferencia,
      emailReferencia,
      nombreEmpresa,
      nombreCandidato,
      cargoCandidato,
      fechaConsulta,
      motivo
    } = data;

    const htmlContent = this.generarPlantillaNotificacionAcceso({
      nombreReferencia,
      nombreEmpresa,
      nombreCandidato,
      cargoCandidato,
      fechaConsulta,
      motivo
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Sistema RRHH Blockchain'}" <${process.env.SMTP_USER}>`,
      to: emailReferencia,
      subject: `🔍 La empresa ${nombreEmpresa} consultó tu referencia para ${nombreCandidato}`,
      html: htmlContent
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Notificación de acceso enviada a ${emailReferencia}`);
      return info;
    } catch (error) {
      console.error('❌ Error al enviar notificación de acceso:', error);
      throw error;
    }
  }

  /**
   * Enviar notificación a candidato cuando empresa consulta sus referencias
   * S008.3
   */
  async enviarEmailNotificacionAccesoCandidato(data) {
    if (!this.transporter) {
      throw new Error('Servicio de email no configurado');
    }

    const {
      nombreCandidato,
      emailCandidato,
      nombreEmpresa,
      nombreReferencia,
      cargoReferencia,
      empresaReferencia,
      fechaConsulta,
      motivo
    } = data;

    const htmlContent = this.generarPlantillaNotificacionAccesoCandidato({
      nombreCandidato,
      nombreEmpresa,
      nombreReferencia,
      cargoReferencia,
      empresaReferencia,
      fechaConsulta,
      motivo
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Sistema RRHH Blockchain'}" <${process.env.SMTP_USER}>`,
      to: emailCandidato,
      subject: `✅ ${nombreEmpresa} consultó tus referencias - Proceso avanzando`,
      html: htmlContent
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Notificación candidato enviada a ${emailCandidato}`);
      return info;
    } catch (error) {
      console.error('❌ Error al enviar notificación a candidato:', error);
      throw error;
    }
  }

  // ========================================
  // S009.7: EMAILS POSTULACIONES
  // ========================================

  /**
   * Enviar email a empresa cuando recibe nueva postulación
   * S009.7
   */
  async enviarEmailNuevaPostulacion(data) {
    if (!this.transporter) {
      console.warn('⚠️  EmailService no configurado. Email no enviado.');
      return false;
    }

    const {
      empresaEmail,
      empresaNombre,
      candidatoNombre,
      vacanteId,
      vacanteTitulo,
      score,
      candidatoUbicacion,
      candidatoExperiencia,
      fechaPostulacion,
      urlDetalle
    } = data;

    const htmlEmail = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px 20px; }
    .score-badge { display: inline-block; background: #10b981; color: white; padding: 10px 20px; border-radius: 25px; font-weight: bold; font-size: 22px; margin: 15px 0; }
    .info-box { background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .info-box p { margin: 8px 0; }
    .button { display: inline-block; background: #667eea; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .tip { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; font-size: 14px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Nueva Postulación Recibida</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${empresaNombre}</strong>,</p>
      <p>Has recibido una nueva postulación para <strong>${vacanteTitulo}</strong>.</p>
      
      <div style="text-align: center;">
        <p><strong>📊 Score de Compatibilidad:</strong></p>
        <span class="score-badge">${score}/100</span>
      </div>

      <div class="info-box">
        <p><strong>👤 Candidato:</strong> ${candidatoNombre}</p>
        <p><strong>📅 Fecha:</strong> ${fechaPostulacion}</p>
        <p><strong>📍 Ubicación:</strong> ${candidatoUbicacion}</p>
        <p><strong>💼 Experiencia:</strong> ${candidatoExperiencia} años</p>
      </div>

      <p>El algoritmo de matching evaluó automáticamente la compatibilidad con tus requisitos.</p>

      <div style="text-align: center;">
        <a href="${urlDetalle}" class="button">Ver Perfil Completo y Desglose</a>
      </div>

      <div class="tip">
        💡 <strong>Tip:</strong> Candidatos con score >70 tienen alta compatibilidad técnica. 
        Revisa el desglose para identificar fortalezas y áreas de desarrollo.
      </div>
    </div>
    <div class="footer">
      <p>Sistema RRHH Blockchain - Gestión Inteligente de Talento</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/configuracion/notificaciones" style="color: #667eea;">Gestionar notificaciones</a></p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Sistema RRHH Blockchain'}" <${process.env.SMTP_USER}>`,
        to: empresaEmail,
        subject: `🎯 Nueva postulación: ${candidatoNombre} - Score ${score}/100`,
        html: htmlEmail
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email nueva postulación enviado a ${empresaEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email nueva postulación:', error.message);
      return false;
    }
  }

  /**
   * Enviar confirmación a candidato al postular
   * S009.7
   */
  async enviarEmailConfirmacionPostulacion(data) {
    if (!this.transporter) {
      console.warn('⚠️  EmailService no configurado. Email no enviado.');
      return false;
    }

    const {
      candidatoEmail,
      candidatoNombre,
      vacanteTitulo,
      empresaNombre,
      score,
      scoreHabilidades,
      scoreExperiencia,
      scoreEducacion,
      scoreUbicacion,
      vacanteModalidad,
      vacanteUbicacion,
      fechaPostulacion,
      urlDetalle
    } = data;

    const htmlEmail = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px 20px; }
    .score-badge { display: inline-block; background: #667eea; color: white; padding: 10px 20px; border-radius: 25px; font-weight: bold; font-size: 22px; margin: 15px 0; }
    .info-box { background: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .desglose { background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin: 15px 0; }
    .desglose-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .desglose-item:last-child { border-bottom: none; }
    .button { display: inline-block; background: #10b981; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .tip { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; font-size: 14px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Postulación Enviada Exitosamente</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${candidatoNombre}</strong>,</p>
      <p>Tu postulación para <strong>${vacanteTitulo}</strong> en <strong>${empresaNombre}</strong> ha sido recibida correctamente.</p>

      <div style="text-align: center;">
        <p><strong>📊 Tu Score de Compatibilidad:</strong></p>
        <span class="score-badge">${score}/100</span>
      </div>

      <div class="info-box">
        <p><strong>📅 Fecha de postulación:</strong> ${fechaPostulacion}</p>
        <p><strong>🏢 Modalidad:</strong> ${vacanteModalidad}</p>
        <p><strong>📍 Ubicación:</strong> ${vacanteUbicacion}</p>
      </div>

      <p><strong>Desglose de tu score:</strong></p>
      <div class="desglose">
        <div class="desglose-item">
          <span>💻 Habilidades técnicas</span>
          <strong>${scoreHabilidades}/40</strong>
        </div>
        <div class="desglose-item">
          <span>💼 Experiencia laboral</span>
          <strong>${scoreExperiencia}/25</strong>
        </div>
        <div class="desglose-item">
          <span>🎓 Educación</span>
          <strong>${scoreEducacion}/20</strong>
        </div>
        <div class="desglose-item">
          <span>📍 Ubicación</span>
          <strong>${scoreUbicacion}/15</strong>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${urlDetalle}" class="button">Ver Desglose Completo</a>
      </div>

      <div class="tip">
        📬 La empresa revisará tu perfil próximamente. Te notificaremos cualquier actualización del estado de tu postulación.
      </div>

      <div class="tip" style="background: #fef3c7; border-color: #f59e0b;">
        💡 <strong>Tip:</strong> Mientras esperas, mejora tu perfil agregando certificaciones o actualizando experiencia para futuras postulaciones.
      </div>
    </div>
    <div class="footer">
      <p>Sistema RRHH Blockchain</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/mis-postulaciones" style="color: #10b981;">Ver todas mis postulaciones</a></p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Sistema RRHH Blockchain'}" <${process.env.SMTP_USER}>`,
        to: candidatoEmail,
        subject: `✅ Postulación confirmada: ${vacanteTitulo} - Score ${score}/100`,
        html: htmlEmail
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email confirmación enviado a ${candidatoEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando confirmación:', error.message);
      return false;
    }
  }

  /**
   * Enviar email cambio de estado (genérico)
   * S009.7
   */
  async enviarEmailCambioEstado(data) {
    if (!this.transporter) {
      console.warn('⚠️  EmailService no configurado. Email no enviado.');
      return false;
    }

    const {
      candidatoEmail,
      candidatoNombre,
      vacanteTitulo,
      empresaNombre,
      estadoAnterior,
      estadoNuevo,
      mensajeEstado,
      urlPostulacion
    } = data;

    const estadosEmojis = {
      'postulado': '📝',
      'revisado': '👀',
      'preseleccionado': '⭐',
      'entrevista': '🎤',
      'contratado': '🎉',
      'rechazado': '❌'
    };

    const emojiNuevo = estadosEmojis[estadoNuevo] || '📢';

    const htmlEmail = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #fff; padding: 30px 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .info-box { background: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .estado-badge { display: inline-block; background: #3b82f6; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; }
    .button { display: inline-block; background: #3b82f6; color: #fff !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${emojiNuevo} Actualización de Tu Postulación</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${candidatoNombre}</strong>,</p>
      <p>Tu postulación para <strong>${vacanteTitulo}</strong> en <strong>${empresaNombre}</strong> ha sido actualizada.</p>

      <div class="info-box">
        <p><strong>Estado anterior:</strong> ${estadoAnterior}</p>
        <p><strong>Estado actual:</strong> <span class="estado-badge">${estadoNuevo}</span></p>
      </div>

      <div style="background: #f0f9ff; padding: 20px; border-radius: 6px; margin: 20px 0;">
        ${mensajeEstado}
      </div>

      <div style="text-align: center;">
        <a href="${urlPostulacion}" class="button">Ver Detalles</a>
      </div>
    </div>
    <div class="footer">
      <p>Sistema RRHH Blockchain</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Sistema RRHH Blockchain'}" <${process.env.SMTP_USER}>`,
        to: candidatoEmail,
        subject: `${emojiNuevo} Actualización: ${vacanteTitulo} - ${estadoNuevo}`,
        html: htmlEmail
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email cambio estado enviado a ${candidatoEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando cambio estado:', error.message);
      return false;
    }
  }

  /**
   * Enviar email candidato preseleccionado
   * S009.7
   */
  async enviarEmailPreseleccionado(data) {
    if (!this.transporter) {
      console.warn('⚠️  EmailService no configurado. Email no enviado.');
      return false;
    }

    const {
      candidatoEmail,
      candidatoNombre,
      vacanteTitulo,
      empresaNombre,
      score,
      urlPostulacion
    } = data;

    const htmlEmail = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #fff; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 25px; }
    .congrats-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; padding: 25px; margin: 25px 0; border-radius: 8px; text-align: center; }
    .congrats-box h2 { color: #92400e; margin: 0 0 10px 0; font-size: 24px; }
    .info-box { background: #f9fafb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .next-steps { background: #fff; border: 2px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .next-steps h3 { color: #374151; margin-top: 0; }
    .next-steps ul { padding-left: 20px; }
    .next-steps li { margin: 10px 0; color: #4b5563; }
    .button { display: inline-block; background: #f59e0b; color: #fff !important; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 700; margin: 20px 0; font-size: 16px; }
    .button:hover { background: #d97706; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⭐ ¡FELICITACIONES!</h1>
    </div>
    <div class="content">
      <div class="congrats-box">
        <h2>🎉 Has sido preseleccionado/a</h2>
        <p style="font-size: 16px; color: #92400e; margin: 10px 0;">Estás entre los finalistas para <strong>${vacanteTitulo}</strong></p>
      </div>

      <p style="font-size: 16px;">Hola <strong>${candidatoNombre}</strong>,</p>
      
      <p>Nos complace informarte que <strong>${empresaNombre}</strong> te ha seleccionado como uno de los candidatos finalistas para la posición de <strong>${vacanteTitulo}</strong>.</p>

      <div class="info-box">
        <p><strong>📊 Tu Score de Compatibilidad:</strong> ${score}/100</p>
        <p><strong>🏆 Estado:</strong> <span style="color: #d97706; font-weight: bold;">PRESELECCIONADO</span></p>
        <p><strong>🔥 Eres parte del top de candidatos</strong></p>
      </div>

      <div class="next-steps">
        <h3>📋 Próximos Pasos:</h3>
        <ul>
          <li><strong>Mantente atento:</strong> La empresa podría contactarte pronto para agendar entrevista</li>
          <li><strong>Revisa tu email:</strong> Recibirás notificaciones de cualquier actualización</li>
          <li><strong>Prepárate:</strong> Investiga sobre la empresa y repasa tus habilidades técnicas</li>
          <li><strong>Disponibilidad:</strong> Asegúrate de estar disponible en los próximos días</li>
        </ul>
      </div>

      <div style="text-align: center;">
        <a href="${urlPostulacion}" class="button">Ver Estado de Mi Postulación</a>
      </div>

      <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af;"><strong>💡 Consejo:</strong> Este es un momento crucial. Mantén tu perfil actualizado y responde rápido a cualquier comunicación de la empresa.</p>
      </div>

      <p style="margin-top: 30px; color: #6b7280; text-align: center;">¡Te deseamos mucho éxito en la siguiente fase del proceso!</p>
    </div>
    <div class="footer">
      <p><strong>Sistema RRHH Blockchain</strong></p>
      <p>Conectando talento con oportunidades</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Sistema RRHH Blockchain'}" <${process.env.SMTP_USER}>`,
        to: candidatoEmail,
        subject: `⭐ ¡PRESELECCIONADO! ${vacanteTitulo} en ${empresaNombre}`,
        html: htmlEmail
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email preselección enviado a ${candidatoEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email preselección:', error.message);
      return false;
    }
  }

  /**
   * Enviar email candidato rechazado (constructivo)
   * S009.7
   */
  async enviarEmailRechazado(data) {
    if (!this.transporter) {
      console.warn('⚠️  EmailService no configurado. Email no enviado.');
      return false;
    }

    const {
      candidatoEmail,
      candidatoNombre,
      vacanteTitulo,
      empresaNombre,
      motivoOpcional
    } = data;

    const htmlEmail = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: #fff; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 35px 25px; }
    .info-box { background: #f9fafb; border-left: 4px solid #6b7280; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .feedback-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .encouragement { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px; }
    .tips { background: #fff; border: 2px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .tips h3 { color: #374151; margin-top: 0; }
    .tips ul { padding-left: 20px; }
    .tips li { margin: 10px 0; color: #4b5563; }
    .button { display: inline-block; background: #3b82f6; color: #fff !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Actualización de Tu Postulación</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${candidatoNombre}</strong>,</p>
      
      <p>Agradecemos sinceramente tu interés en la posición de <strong>${vacanteTitulo}</strong> en <strong>${empresaNombre}</strong> y el tiempo que dedicaste a tu postulación.</p>

      <div class="info-box">
        <p>Después de una cuidadosa evaluación de todos los candidatos, hemos decidido continuar el proceso con otros perfiles que se ajustan más específicamente a nuestras necesidades actuales para este rol.</p>
      </div>

      ${motivoOpcional ? `
      <div class="feedback-box">
        <p><strong>📝 Feedback del proceso:</strong></p>
        <p style="font-style: italic;">${motivoOpcional}</p>
      </div>
      ` : ''}

      <div class="encouragement">
        <p style="margin: 0; color: #1e40af;"><strong>💪 No te desanimes:</strong> Un rechazo no define tu valor profesional. Cada proceso de selección tiene requisitos muy específicos y a veces es simplemente una cuestión de timing o fit particular con el equipo.</p>
      </div>

      <div class="tips">
        <h3>🚀 Consejos para Futuras Postulaciones:</h3>
        <ul>
          <li><strong>Continúa desarrollando tus habilidades:</strong> Invierte en capacitación y certificaciones relevantes</li>
          <li><strong>Actualiza tu perfil:</strong> Mantén tu experiencia y proyectos al día en la plataforma</li>
          <li><strong>Networking:</strong> Conecta con profesionales de tu industria</li>
          <li><strong>Practica entrevistas:</strong> La práctica mejora significativamente el desempeño</li>
          <li><strong>No dejes de postular:</strong> Cada aplicación es una oportunidad de aprendizaje</li>
        </ul>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vacantes" class="button">Explorar Otras Oportunidades</a>
      </p>

      <p style="margin-top: 30px; color: #6b7280;">Te deseamos mucho éxito en tu búsqueda profesional. Estamos seguros de que encontrarás la oportunidad perfecta para ti.</p>

      <p style="margin-top: 20px;"><strong>¡Gracias por confiar en RRHH Blockchain!</strong></p>
    </div>
    <div class="footer">
      <p><strong>Sistema RRHH Blockchain</strong></p>
      <p>Construyendo el futuro del reclutamiento</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Sistema RRHH Blockchain'}" <${process.env.SMTP_USER}>`,
        to: candidatoEmail,
        subject: `Actualización: ${vacanteTitulo} en ${empresaNombre}`,
        html: htmlEmail
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email rechazo enviado a ${candidatoEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email rechazo:', error.message);
      return false;
    }
  }

  /**
   * Enviar email candidato contratado (bienvenida)
   * S009.7
   */
  async enviarEmailContratado(data) {
    if (!this.transporter) {
      console.warn('⚠️  EmailService no configurado. Email no enviado.');
      return false;
    }

    const {
      candidatoEmail,
      candidatoNombre,
      vacanteTitulo,
      empresaNombre,
      urlPostulacion
    } = data;

    const htmlEmail = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; padding: 50px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
    .content { padding: 40px 25px; }
    .celebration { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 3px solid #10b981; padding: 30px; margin: 25px 0; border-radius: 12px; text-align: center; }
    .celebration h2 { color: #065f46; margin: 0 0 15px 0; font-size: 28px; }
    .celebration p { color: #047857; font-size: 18px; margin: 5px 0; }
    .info-box { background: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .next-steps { background: #fff; border: 2px solid #e5e7eb; padding: 25px; margin: 20px 0; border-radius: 8px; }
    .next-steps h3 { color: #374151; margin-top: 0; }
    .next-steps ul { padding-left: 20px; }
    .next-steps li { margin: 12px 0; color: #4b5563; }
    .button { display: inline-block; background: #10b981; color: #fff !important; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 700; margin: 20px 0; font-size: 16px; }
    .button:hover { background: #059669; }
    .congrats-note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ¡CONTRATADO!</h1>
    </div>
    <div class="content">
      <div class="celebration">
        <h2>🎊 ¡FELICITACIONES ${candidatoNombre}! 🎊</h2>
        <p>Has sido seleccionado/a para unirte al equipo de</p>
        <p style="font-size: 24px; font-weight: bold; color: #065f46;">${empresaNombre}</p>
      </div>

      <p style="font-size: 16px;">Estimado/a <strong>${candidatoNombre}</strong>,</p>
      
      <p>Es un placer informarte que has sido <strong>oficialmente contratado/a</strong> para la posición de <strong>${vacanteTitulo}</strong> en <strong>${empresaNombre}</strong>.</p>

      <div class="info-box">
        <p><strong>✅ Posición:</strong> ${vacanteTitulo}</p>
        <p><strong>🏢 Empresa:</strong> ${empresaNombre}</p>
        <p><strong>📅 Estado:</strong> <span style="color: #10b981; font-weight: bold;">CONTRATADO</span></p>
      </div>

      <div class="next-steps">
        <h3>📋 Próximos Pasos:</h3>
        <ul>
          <li><strong>Contacto directo:</strong> La empresa se pondrá en contacto contigo pronto con los detalles del contrato y fecha de inicio</li>
          <li><strong>Documentación:</strong> Prepara tu documentación personal (CI, certificados, referencias)</li>
          <li><strong>Onboarding:</strong> Recibirás información sobre el proceso de integración</li>
          <li><strong>Primer día:</strong> Te compartirán detalles sobre ubicación, horario y equipo</li>
        </ul>
      </div>

      <div style="text-align: center;">
        <a href="${urlPostulacion}" class="button">Ver Detalles de Mi Contratación</a>
      </div>

      <div class="congrats-note">
        <p style="margin: 0;"><strong>🌟 ¡Bienvenido/a al equipo!</strong></p>
        <p style="margin: 10px 0 0 0;">Tu talento y esfuerzo han dado frutos. Estamos emocionados de que inicies esta nueva etapa profesional.</p>
      </div>

      <p style="margin-top: 30px; text-align: center; color: #6b7280;">Si tienes alguna pregunta, la empresa se pondrá en contacto contigo directamente.</p>

      <p style="margin-top: 30px; text-align: center; font-size: 18px;"><strong>¡Te deseamos mucho éxito en tu nuevo rol! 🚀</strong></p>
    </div>
    <div class="footer">
      <p><strong>Sistema RRHH Blockchain</strong></p>
      <p>Construyendo puentes entre talento y oportunidades</p>
      <p style="margin-top: 10px;">Gracias por confiar en nosotros para tu búsqueda profesional</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Sistema RRHH Blockchain'}" <${process.env.SMTP_USER}>`,
        to: candidatoEmail,
        subject: `🎉 ¡CONTRATADO! ${vacanteTitulo} en ${empresaNombre}`,
        html: htmlEmail
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email contratación enviado a ${candidatoEmail}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email contratación:', error.message);
      return false;
    }
  }

  // ========================================
  // FIN S009.7
  // ========================================

  /**
   * Generar plantilla HTML para email de verificación
   * S008.2
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
   * Generar plantilla HTML notificación acceso a referencia
   * S008.3
   */
  generarPlantillaNotificacionAcceso(data) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            background: #f8fafc;
            padding: 30px;
            border-left: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #1e293b;
        }
        .info-box {
            background: white;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .info-box h3 {
            margin-top: 0;
            color: #1e40af;
            font-size: 18px;
        }
        .info-row {
            margin: 12px 0;
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #475569;
            display: inline-block;
            width: 140px;
        }
        .info-value {
            color: #1e293b;
        }
        .motivo-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-style: italic;
        }
        .what-means {
            background: #ecfdf5;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .what-means h4 {
            color: #059669;
            margin-top: 0;
        }
        .what-means ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .what-means li {
            margin: 8px 0;
            color: #064e3b;
        }
        .footer {
            background: #1e293b;
            color: #cbd5e1;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            border-radius: 0 0 10px 10px;
        }
        .footer a {
            color: #60a5fa;
            text-decoration: none;
        }
        .alert {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .alert strong {
            color: #991b1b;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Consulta de Referencia Profesional</h1>
    </div>
    
    <div class="content">
        <p class="greeting">Estimado/a <strong>${data.nombreReferencia}</strong>,</p>
        
        <p>Te informamos que la empresa <strong>${data.nombreEmpresa}</strong> ha consultado la referencia profesional que proporcionaste para <strong>${data.nombreCandidato}</strong>.</p>
        
        <div class="info-box">
            <h3>📋 Detalles de la Consulta</h3>
            <div class="info-row">
                <span class="info-label">Candidato:</span>
                <span class="info-value">${data.nombreCandidato}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Cargo postulado:</span>
                <span class="info-value">${data.cargoCandidato}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Empresa consultante:</span>
                <span class="info-value">${data.nombreEmpresa}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Fecha de consulta:</span>
                <span class="info-value">${data.fechaConsulta}</span>
            </div>
        </div>
        
        <div class="motivo-box">
            <strong>Motivo de la consulta:</strong><br>
            "${data.motivo}"
        </div>
        
        <div class="what-means">
            <h4>¿Qué significa esto?</h4>
            <ul>
                <li><strong>Transparencia total:</strong> Cumplimos con normativas de protección de datos informándote cuando alguien accede a tu información</li>
                <li><strong>Posible contacto:</strong> La empresa podría comunicarse contigo para validar información adicional sobre el candidato</li>
                <li><strong>Tu derecho:</strong> Puedes rechazar proporcionar información adicional si lo consideras necesario</li>
                <li><strong>Confidencialidad:</strong> Solo empresas autorizadas pueden acceder a referencias verificadas</li>
            </ul>
        </div>
        
        <div class="alert">
            <strong>⚠️ Importante:</strong> Si recibes contacto directo de la empresa y no deseas proporcionar más información, tienes derecho a negarte. Esta notificación es solo informativa.
        </div>
        
        <p style="margin-top: 30px;">Si tienes alguna pregunta sobre esta consulta o deseas más información, no dudes en contactarnos.</p>
    </div>
    
    <div class="footer">
        <p style="margin: 0 0 10px 0;">
            <strong>RRHH Blockchain</strong><br>
            Sistema de Gestión de Referencias Profesionales
        </p>
        <p style="margin: 10px 0;">
            ¿Preguntas? <a href="mailto:soporte@rrhhblockchain.com">soporte@rrhhblockchain.com</a>
        </p>
        <p style="margin: 10px 0; font-size: 12px; color: #94a3b8;">
            Este es un email automático generado por el sistema. Por favor no responder directamente a este correo.
        </p>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generar plantilla HTML notificación acceso a candidato
   * S008.3
   */
  generarPlantillaNotificacionAccesoCandidato(data) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            background: #f8fafc;
            padding: 30px;
            border-left: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
        }
        .success-badge {
            background: #d1fae5;
            color: #065f46;
            padding: 12px 20px;
            border-radius: 6px;
            text-align: center;
            font-weight: 600;
            margin: 20px 0;
        }
        .info-box {
            background: white;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .info-row {
            margin: 12px 0;
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #475569;
            display: inline-block;
            width: 140px;
        }
        .info-value {
            color: #1e293b;
        }
        .footer {
            background: #1e293b;
            color: #cbd5e1;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            border-radius: 0 0 10px 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Avance en tu Proceso de Selección</h1>
    </div>
    
    <div class="content">
        <p>Hola <strong>${data.nombreCandidato}</strong>,</p>
        
        <div class="success-badge">
            ¡Buenas noticias! La empresa ${data.nombreEmpresa} está revisando tus referencias
        </div>
        
        <p>Te informamos que <strong>${data.nombreEmpresa}</strong> ha consultado una de tus referencias profesionales verificadas. Esto indica que tu postulación está avanzando en el proceso de selección.</p>
        
        <div class="info-box">
            <h3>📋 Detalles de la Consulta</h3>
            <div class="info-row">
                <span class="info-label">Empresa:</span>
                <span class="info-value">${data.nombreEmpresa}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Referencia consultada:</span>
                <span class="info-value">${data.nombreReferencia}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Cargo:</span>
                <span class="info-value">${data.cargoReferencia} en ${data.empresaReferencia}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Fecha:</span>
                <span class="info-value">${data.fechaConsulta}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Motivo:</span>
                <span class="info-value">${data.motivo}</span>
            </div>
        </div>
        
        <p style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <strong>💡 Consejo:</strong> Es posible que la empresa contacte directamente a tu referencia. Asegúrate de que ${data.nombreReferencia} esté al tanto de tu postulación.
        </p>
        
        <p>Gracias por usar RRHH Blockchain. ¡Te deseamos éxito en tu proceso de selección!</p>
    </div>
    
    <div class="footer">
        <p style="margin: 0;">
            <strong>RRHH Blockchain</strong><br>
            Sistema de Gestión de Referencias Profesionales
        </p>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generar versión texto plano del email
   * S008.2
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