import request from 'supertest';
import 'dotenv/config';

const baseUrl = process.env.API_URL || 'http://localhost:3000';

/**
 * Realiza login do Administrador e retorna o token JWT
 */
export async function getAdminToken() {
  const response = await request(baseUrl)
    .post('/api/auth/login')
    .send({
      email: process.env.ADMIN_EMAIL,
      senha: process.env.ADMIN_PASSWORD
    });

  if (response.status !== 200) {
    throw new Error(`Falha no login do Admin: ${JSON.stringify(response.body)}`);
  }

  return response.body.token;
}

/**
 * Realiza login de um Aluno específico e retorna o token JWT
 */
export async function getAlunoToken(email, senha) {
  const response = await request(baseUrl)
    .post('/api/auth/login')
    .send({ email, senha });

  if (response.status !== 200) {
    throw new Error(`Falha no login do Aluno (${email}): ${JSON.stringify(response.body)}`);
  }

  return response.body.token;
}