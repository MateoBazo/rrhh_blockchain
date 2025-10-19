// file: backend/tests/educacion.test.js
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/models');

describe('🎓 Tests de Educación', () => {
  let tokenCandidato;
  let candidatoId;

  beforeAll(async () => {
    // ✅ CAMBIAR: No usar force:true, usar alter:true
    await db.sequelize.sync({ alter: true });

    const resRegistro = await request(app)
      .post('/api/auth/registrar')
      .send({
        email: 'candidato.edu@test.com',
        password: 'Test1234!',
        nombre_completo: 'Candidato Educacion Test',
        rol: 'CANDIDATO'
      });

    tokenCandidato = resRegistro.body.data.token;

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
    // ✅ Limpiar datos de prueba
    if (candidatoId) {
      await db.Educacion.destroy({ where: { candidato_id: candidatoId } });
      await db.Candidato.destroy({ where: { id: candidatoId } });
    }
    await db.sequelize.close();
  });

  describe('POST /api/educacion', () => {
    test('Debería crear educación exitosamente', async () => {
      const res = await request(app)
        .post('/api/educacion')
        .set('Authorization', `Bearer ${tokenCandidato}`)
        .send({
          nivel_educacion: 'UNIVERSITARIO',
          institucion: 'Universidad Mayor de San Andrés',
          titulo_obtenido: 'Ingeniero de Sistemas',
          campo_estudio: 'Ingeniería de Sistemas',
          fecha_inicio: '2015-01-15',
          fecha_fin: '2020-12-15',
          en_curso: false,
          promedio: 85.5
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.institucion).toBe('Universidad Mayor de San Andrés');
    });

    test('Debería rechazar educación con nivel inválido', async () => {
      const res = await request(app)
        .post('/api/educacion')
        .set('Authorization', `Bearer ${tokenCandidato}`)
        .send({
          nivel_educacion: 'INVALIDO',
          institucion: 'Test',
          titulo_obtenido: 'Test',
          fecha_inicio: '2015-01-15'
        });

      expect(res.status).toBe(400);
    });

    test('Debería rechazar fecha_fin anterior a fecha_inicio', async () => {
      const res = await request(app)
        .post('/api/educacion')
        .set('Authorization', `Bearer ${tokenCandidato}`)
        .send({
          nivel_educacion: 'TECNICO',
          institucion: 'Instituto Test',
          titulo_obtenido: 'Técnico en Programación',
          fecha_inicio: '2020-01-15',
          fecha_fin: '2019-12-15'
        });

      expect(res.status).toBe(400);
      expect(res.body.mensaje).toContain('fecha de fin debe ser posterior');
    });
  });

  describe('GET /api/educacion', () => {
    test('Debería listar educación del candidato', async () => {
      const res = await request(app)
        .get('/api/educacion')
        .set('Authorization', `Bearer ${tokenCandidato}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('PUT /api/educacion/:id', () => {
    let educacionId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/educacion')
        .set('Authorization', `Bearer ${tokenCandidato}`)
        .send({
          nivel_educacion: 'MAESTRIA',
          institucion: 'Universidad Católica',
          titulo_obtenido: 'MBA',
          fecha_inicio: '2021-01-15'
        });

      educacionId = res.body.data.id;
    });

    test('Debería actualizar educación exitosamente', async () => {
      const res = await request(app)
        .put(`/api/educacion/${educacionId}`)
        .set('Authorization', `Bearer ${tokenCandidato}`)
        .send({
          promedio: 90.0
        });

      expect(res.status).toBe(200);
      expect(res.body.data.promedio).toBe('90.00');
    });
  });

  describe('DELETE /api/educacion/:id', () => {
    let educacionId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/educacion')
        .set('Authorization', `Bearer ${tokenCandidato}`)
        .send({
          nivel_educacion: 'SECUNDARIA',
          institucion: 'Colegio Test',
          titulo_obtenido: 'Bachiller',
          fecha_inicio: '2010-01-15',
          fecha_fin: '2014-12-15'
        });

      educacionId = res.body.data.id;
    });

    test('Debería eliminar educación exitosamente', async () => {
      const res = await request(app)
        .delete(`/api/educacion/${educacionId}`)
        .set('Authorization', `Bearer ${tokenCandidato}`);

      expect(res.status).toBe(200);
      expect(res.body.mensaje).toContain('eliminada exitosamente');
    });
  });
});