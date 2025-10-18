// file: backend/tests/empresa.test.js
const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/config/database');
const { Usuario, Empresa } = require('../src/models');

let tokenAdmin;
let tokenCandidato;

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });

  // Crear usuarios de prueba
  const admin = await Usuario.create({
    nombre_completo: 'Admin Test',
    email: 'admin@example.com',
    password_hash: 'Password123',
    rol: 'admin_empresa'
  });

  const candidato = await Usuario.create({
    nombre_completo: 'Candidato Test',
    email: 'candidato@example.com',
    password_hash: 'Password123',
    rol: 'candidato'
  });

  // Obtener tokens
  const loginAdmin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'Password123' });
  tokenAdmin = loginAdmin.body.datos.token;

  const loginCandidato = await request(app)
    .post('/api/auth/login')
    .send({ email: 'candidato@example.com', password: 'Password123' });
  tokenCandidato = loginCandidato.body.datos.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Empresa Endpoints', () => {

  describe('POST /api/empresas', () => {
    it('Debe crear empresa con rol admin', async () => {
      const response = await request(app)
        .post('/api/empresas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          razon_social: 'Empresa Test S.A.C.',
          ruc: '20123456789',
          direccion: 'Av. Test 123',
          telefono: '987654321',
          email_contacto: 'contacto@empresatest.com',
          sector_industria: 'Tecnología'
        });

      expect(response.status).toBe(201);
      expect(response.body.exito).toBe(true);
      expect(response.body.datos.razon_social).toBe('Empresa Test S.A.C.');
    });

    it('Debe fallar sin permisos de admin', async () => {
      const response = await request(app)
        .post('/api/empresas')
        .set('Authorization', `Bearer ${tokenCandidato}`)
        .send({
          razon_social: 'Empresa Sin Permisos',
          ruc: '20987654321'
        });

      expect(response.status).toBe(403);
      expect(response.body.exito).toBe(false);
    });

    it('Debe fallar con RUC duplicado', async () => {
      await Empresa.create({
        razon_social: 'Empresa Existente',
        ruc: '20111111111'
      });

      const response = await request(app)
        .post('/api/empresas')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          razon_social: 'Otra Empresa',
          ruc: '20111111111'
        });

      expect(response.status).toBe(409);
      expect(response.body.exito).toBe(false);
    });
  });

  describe('GET /api/empresas', () => {
    beforeEach(async () => {
      await Empresa.bulkCreate([
        { razon_social: 'Empresa 1', ruc: '20100000001' },
        { razon_social: 'Empresa 2', ruc: '20100000002' },
        { razon_social: 'Empresa 3', ruc: '20100000003', activo: false }
      ]);
    });

    it('Debe obtener lista de empresas', async () => {
      const response = await request(app)
        .get('/api/empresas')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      expect(response.body.datos.empresas).toBeInstanceOf(Array);
      expect(response.body.datos.total).toBeGreaterThan(0);
    });

    it('Debe filtrar empresas activas', async () => {
      const response = await request(app)
        .get('/api/empresas?activo=true')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(response.status).toBe(200);
      expect(response.body.datos.empresas.every(e => e.activo)).toBe(true);
    });
  });
});