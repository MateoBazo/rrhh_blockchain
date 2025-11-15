// file: backend/src/services/historialLaboralNotifications.js

/**
 * SERVICIO: Notificaciones Historial Laboral
 * S009.3 - Emails para certificación bidireccional empresa↔empleado
 */

const emailService = require('./emailService'); // ✅ USAR TU SERVICIO EXISTENTE

/**
 * Enviar email cuando empresa certifica experiencia
 */
const notificarCertificacionPendiente = async (historial, candidato) => {
  try {
    // Verificar que emailService está disponible
    if (!emailService.transporter) {
      console.warn('⚠️  EmailService no configurado. Email no enviado.');
      return false;
    }

    const linkAceptar = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/certificaciones/responder/${historial.id}?accion=aceptar`;
    const linkRechazar = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/certificaciones/responder/${historial.id}?accion=rechazar`;

    const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2563eb; }
    .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .btn-accept { background: #10b981; color: white !important; }
    .btn-reject { background: #ef4444; color: white !important; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏢 Nueva Certificación Laboral</h1>
  </div>
  
  <div class="content">
    <p>Hola <strong>${candidato.nombres} ${candidato.apellido_paterno}</strong>,</p>
    
    <p>La empresa <strong>${historial.empresa_nombre}</strong> ha certificado tu experiencia laboral:</p>
    
    <div class="info-box">
      <p><strong>Cargo:</strong> ${historial.cargo}</p>
      <p><strong>Período:</strong> ${historial.fecha_inicio} ${historial.fecha_fin ? '- ' + historial.fecha_fin : '- Actualidad'}</p>
      ${historial.departamento ? `<p><strong>Departamento:</strong> ${historial.departamento}</p>` : ''}
    </div>

    <div class="warning">
      <p><strong>⚠️ Acción requerida en 30 días</strong></p>
      <p>Debes aceptar o rechazar esta certificación. Después de 30 días sin respuesta, expirará automáticamente.</p>
    </div>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${linkAceptar}" class="button btn-accept">✅ Aceptar Certificación</a>
      <a href="${linkRechazar}" class="button btn-reject">❌ Rechazar Certificación</a>
    </p>

    <p style="font-size: 14px; color: #6b7280;">
      Una vez aceptada, esta certificación será visible en tu perfil público y servirá como prueba verificada de tu experiencia laboral.
    </p>
  </div>

  <div class="footer">
    <p>Sistema RRHH Blockchain - Verificación Laboral</p>
  </div>
</body>
</html>
    `;

    // ✅ USAR EL MÉTODO DE TU emailService
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Sistema RRHH Blockchain'}" <${process.env.SMTP_USER}>`,
      to: candidato.usuario?.email || candidato.email,
      subject: `🏢 Nueva certificación laboral de ${historial.empresa_nombre}`,
      html: htmlEmail
    };

    await emailService.transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${candidato.nombres} ${candidato.apellido_paterno}`);
    return true;

  } catch (error) {
    console.error('❌ Error al enviar email:', error.message);
    return false;
  }
};

/**
 * Enviar email cuando empleado acepta certificación
 */
const notificarCertificacionAceptada = async (historial, candidato, empresa) => {
  try {
    if (!emailService.transporter) {
      console.warn('⚠️  EmailService no configurado. Email no enviado.');
      return false;
    }

    const htmlEmail = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
    <h1>✅ Certificación Aceptada</h1>
  </div>
  
  <div style="padding: 30px; background: #f9fafb;">
    <p><strong>${candidato.nombres} ${candidato.apellido_paterno}</strong> ha aceptado la certificación laboral.</p>
    
    <div style="background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10b981;">
      <p><strong>Cargo:</strong> ${historial.cargo}</p>
      <p><strong>Estado:</strong> <span style="color: #10b981;">ACEPTADO ✓</span></p>
    </div>

    <p>Esta certificación ahora está <strong>inmutable</strong> y visible en el perfil público del candidato.</p>
  </div>
</body>
</html>
    `;

    if (empresa.usuario_admin?.email) {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Sistema RRHH Blockchain'}" <${process.env.SMTP_USER}>`,
        to: empresa.usuario_admin.email,
        subject: `✅ Certificación aceptada - ${candidato.nombres} ${candidato.apellido_paterno}`,
        html: htmlEmail
      };

      await emailService.transporter.sendMail(mailOptions);
    }

    return true;
  } catch (error) {
    console.error('❌ Error email aceptación:', error.message);
    return false;
  }
};

/**
 * Enviar email cuando empleado rechaza certificación
 */
const notificarCertificacionRechazada = async (historial, candidato, empresa, motivo) => {
  try {
    if (!emailService.transporter) {
      console.warn('⚠️  EmailService no configurado. Email no enviado.');
      return false;
    }

    const htmlEmail = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
    <h1>❌ Certificación Rechazada</h1>
  </div>
  
  <div style="padding: 30px; background: #f9fafb;">
    <p><strong>${candidato.nombres} ${candidato.apellido_paterno}</strong> ha rechazado la certificación.</p>
    
    <div style="background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #ef4444;">
      <p><strong>Cargo:</strong> ${historial.cargo}</p>
      <p><strong>Estado:</strong> <span style="color: #ef4444;">RECHAZADO ✗</span></p>
    </div>

    ${motivo ? `
    <div style="background: #fef3c7; padding: 15px; margin: 15px 0;">
      <p><strong>Motivo:</strong></p>
      <p style="font-style: italic;">"${motivo}"</p>
    </div>
    ` : ''}

    <p style="color: #6b7280;">Verifiquen la información y corrijan si es necesario.</p>
  </div>
</body>
</html>
    `;

    if (empresa.usuario_admin?.email) {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Sistema RRHH Blockchain'}" <${process.env.SMTP_USER}>`,
        to: empresa.usuario_admin.email,
        subject: `❌ Certificación rechazada - ${candidato.nombres} ${candidato.apellido_paterno}`,
        html: htmlEmail
      };

      await emailService.transporter.sendMail(mailOptions);
    }

    return true;
  } catch (error) {
    console.error('❌ Error email rechazo:', error.message);
    return false;
  }
};

module.exports = {
  notificarCertificacionPendiente,
  notificarCertificacionAceptada,
  notificarCertificacionRechazada
};