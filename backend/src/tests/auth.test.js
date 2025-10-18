// file: backend/tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/config/database');
const { Usuario } = require('../src/models');

// Setup: Conectar a DB antes de tests
beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true }); // Crear tablas limpias para tests
});

// Teardown: Cerrar conexión después de tests
afterAll(async () => {
  await sequelize.close();
});

describe('Auth Endpoints', () => {
  
  describe('POST /api/auth/registrar', () => {
    it('Debe registrar un nuevo usuario exitosamente', async () => {
      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          nombre_completo: 'Juan Pérez Test',
          email: 'juan.test@example.com',
          password: 'Password123',
          telefono: '987654321'
        });

      expect(response.status).toBe(201);
      expect(response.body.exito).toBe(true);
      expect(response.body.datos).toHaveProperty('usuario');
      expect(response.body.datos).toHaveProperty('token');
      expect(response.body.datos.usuario.email).toBe('juan.test@example.com');
      expect(response.body.datos.usuario).not.toHaveProperty('password_hash');
    });

    it('Debe fallar con email duplicado', async () => {
      // Crear usuario primero
      await Usuario.create({
        nombre_completo: 'Usuario Existente',
        email: 'duplicado@example.com',
        password_hash: 'Password123'
      });

      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          nombre_completo: 'Otro Usuario',
          email: 'duplicado@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.exito).toBe(false);
      expect(response.body.mensaje).toContain('ya está registrado');
    });

    it('Debe fallar con validación de password débil', async () => {
      const response = await request(app)
        .post('/api/auth/registrar')
        .send({
          nombre_completo: 'Test User',
          email: 'test@example.com',
          password: '123' // Password débil
        });

      expect(response.status).toBe(400);
      expect(response.body.exito).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Crear usuario de prueba
      await Usuario.create({
        nombre_completo: 'Login Test',
        email: 'login@example.com',
        password_hash: 'Password123',
        rol: 'candidato'
      });
    });

    it('Debe hacer login exitosamente con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      expect(response.body.datos).toHaveProperty('token');
      expect(response.body.datos.usuario.email).toBe('login@example.com');
    });

    it('Debe fallar con email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@example.com',
          password: 'Password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.exito).toBe(false);
      expect(response.body.mensaje).toContain('Credenciales inválidas');
    });

    it('Debe fallar con password incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'PasswordIncorrecta'
        });

      expect(response.status).toBe(401);
      expect(response.body.exito).toBe(false);
    });
  });

  describe('GET /api/auth/perfil', () => {
    let token;

    beforeEach(async () => {
      // Crear usuario y obtener token
      const usuario = await Usuario.create({
        nombre_completo: 'Perfil Test',
        email: 'perfil@example.com',
        password_hash: 'Password123'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'perfil@example.com',
          password: 'Password123'
        });

      token = loginResponse.body.datos.token;
    });

    it('Debe obtener perfil con token válido', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      expect(response.body.datos.email).toBe('perfil@example.com');
    });

    it('Debe fallar sin token', async () => {
      const response = await request(app)
        .get('/api/auth/perfil');

      expect(response.status).toBe(401);
      expect(response.body.exito).toBe(false);
    });

    it('Debe fallar con token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', 'Bearer token_invalido');

      expect(response.status).toBe(401);
      expect(response.body.exito).toBe(false);
    });
  });
});