// file: backend/src/tests/upload.test.js
const request = require('supertest');
const app = require('../app');  
const db = require('../models'); 
const path = require('path');
const fs = require('fs').promises;

describe('📤 Tests de Subida de Archivos', () => {
  let tokenCandidato;
  let candidatoId;
  let usuarioId;

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    // Crear usuario candidato
    const resRegistro = await request(app)
      .post('/api/auth/registrar')
      .send({
        email: 'candidato.upload@test.com',
        password: 'Test1234!',
        nombre_completo: 'Candidato Upload Test',
        rol: 'CANDIDATO'
      });

    tokenCandidato = resRegistro.body.data.token;
    usuarioId = resRegistro.body.data.usuario.id;

    // Crear perfil de candidato
    const resPerfil = await request(app)
      .post('/api/candidatos/perfil')
      .set('Authorization', `Bearer ${tokenCandidato}`)
      .send({
        fecha_nacimiento: '1995-05-15',
        genero: 'M',
        estado_civil: 'SOLTERO',
        nacionalidad: 'Boliviana',
        direccion: 'Calle Test 123',
        ciudad: 'La Paz',
        pais: 'Bolivia'
      });

    candidatoId = resPerfil.body.data.id;
  });

  afterAll(async () => {
    // Limpiar uploads de prueba
    const uploadsDir = path.join(__dirname, '../uploads');
    try {
      const cvDir = path.join(uploadsDir, 'cv');
      const fotosDir = path.join(uploadsDir, 'fotos');
      
      const cvFiles = await fs.readdir(cvDir);
      for (const file of cvFiles) {
        if (file !== '.gitkeep') {
          await fs.unlink(path.join(cvDir, file));
        }
      }

      const fotoFiles = await fs.readdir(fotosDir);
      for (const file of fotoFiles) {
        if (file !== '.gitkeep') {
          await fs.unlink(path.join(fotosDir, file));
        }
      }
    } catch (error) {
      console.log('No hay archivos para limpiar');
    }

    await db.sequelize.close();
  });

  describe('POST /api/upload/cv', () => {
    test('Debería subir CV exitosamente (PDF)', async () => {
      // Crear archivo PDF de prueba
      const testPdfPath = path.join(__dirname, 'test-cv.pdf');
      await fs.writeFile(testPdfPath, 'PDF test content');

      const res = await request(app)
        .post('/api/upload/cv')
        .set('Authorization', `Bearer ${tokenCandidato}`)
        .attach('cv', testPdfPath);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('cv_url');
      expect(res.body.data.mimetype).toBe('application/pdf');

      // Limpiar archivo de prueba
      await fs.unlink(testPdfPath);
    });

    test('Debería rechazar archivo sin autenticación', async () => {
      const testPdfPath = path.join(__dirname, 'test-cv2.pdf');
      await fs.writeFile(testPdfPath, 'PDF test content');

      const res = await request(app)
        .post('/api/upload/cv')
        .attach('cv', testPdfPath);

      expect(res.status).toBe(401);
      await fs.unlink(testPdfPath);
    });

    test('Debería rechazar archivo de tipo no permitido', async () => {
      const testExePath = path.join(__dirname, 'malware.exe');
      await fs.writeFile(testExePath, 'Executable content');

      const res = await request(app)
        .post('/api/upload/cv')
        .set('Authorization', `Bearer ${tokenCandidato}`)
        .attach('cv', testExePath);

      expect(res.status).toBe(400);
      await fs.unlink(testExePath);
    });
  });

  describe('POST /api/upload/foto', () => {
    test('Debería subir foto de perfil exitosamente (PNG)', async () => {
      // Crear imagen PNG mínima (1x1 pixel transparente)
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
      ]);

      const testImagePath = path.join(__dirname, 'test-foto.png');
      await fs.writeFile(testImagePath, pngBuffer);

      const res = await request(app)
        .post('/api/upload/foto')
        .set('Authorization', `Bearer ${tokenCandidato}`)
        .attach('foto', testImagePath);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('foto_url');
      expect(res.body.data.mimetype).toBe('image/png');

      await fs.unlink(testImagePath);
    });

    test('Debería rechazar imagen muy grande (>5MB)', async () => {
      // Crear buffer de 6MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
      const testImagePath = path.join(__dirname, 'large-foto.jpg');
      await fs.writeFile(testImagePath, largeBuffer);

      const res = await request(app)
        .post('/api/upload/foto')
        .set('Authorization', `Bearer ${tokenCandidato}`)
        .attach('foto', testImagePath);

      expect(res.status).toBe(400);
      await fs.unlink(testImagePath);
    });
  });

  describe('GET /api/upload/cv/:id', () => {
    test('Debería descargar CV si está autorizado', async () => {
      // Primero subir un CV
      const testPdfPath = path.join(__dirname, 'download-test.pdf');
      await fs.writeFile(testPdfPath, 'PDF download test');

      await request(app)
        .post('/api/upload/cv')
        .set('Authorization', `Bearer ${tokenCandidato}`)
        .attach('cv', testPdfPath);

      // Ahora descargar
      const res = await request(app)
        .get(`/api/upload/cv/${candidatoId}`)
        .set('Authorization', `Bearer ${tokenCandidato}`);

      expect(res.status).toBe(200);

      await fs.unlink(testPdfPath);
    });

    test('Debería rechazar descarga sin autorización', async () => {
      const res = await request(app)
        .get(`/api/upload/cv/${candidatoId}`);

      expect(res.status).toBe(401);
    });
  });
});