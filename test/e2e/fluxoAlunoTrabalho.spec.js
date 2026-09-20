import request from 'supertest';
import { expect } from 'chai';
import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getAdminToken, getAlunoToken } from '../helpers/auth.helper.js';

const baseUrl = process.env.API_URL || 'http://localhost:3000';

// Carrega os dados do arquivo JSON para o Data-Driven Testing
const testDataPath = resolve('test/data/alunoTrabalhoData.json');
const testCases = JSON.parse(readFileSync(testDataPath, 'utf8'));

describe('Fluxo E2E: Cadastro de Aluno e Entrega de Trabalho', () => {
  let adminToken;

  before(async () => {
    // Autentica como Administrador antes de iniciar os cenários
    adminToken = await getAdminToken();
  });

  testCases.forEach((data) => {
    describe(`Cenário: ${data.cenario}`, () => {
      let alunoId;
      let alunoToken;

      it('1. Deve cadastrar um novo aluno como Administrador', async () => {
        const res = await request(baseUrl)
          .post('/api/admin/alunos')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(data.aluno);

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        expect(res.body.email).to.equal(data.aluno.email);

        // Salva o ID do aluno gerado para as próximas etapas
        alunoId = res.body.id;
      });

      it('2. Administrador deve matricular o novo aluno na disciplina', async () => {
        const res = await request(baseUrl)
          .post(`/api/admin/disciplinas/${data.disciplinaId}/matriculas`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ alunoId });

        expect(res.status).to.equal(201);
      });

      it('3. Deve realizar login como o novo Aluno criado', async () => {
        alunoToken = await getAlunoToken(data.aluno.email, data.aluno.senha);
        expect(alunoToken).to.be.a('string').and.not.be.empty;
      });

      it('4. Aluno deve registrar a entrega de um trabalho', async () => {
        const res = await request(baseUrl)
          .post(`/api/alunos/${alunoId}/trabalhos`)
          .set('Authorization', `Bearer ${alunoToken}`)
          .send({
            disciplinaId: data.disciplinaId,
            titulo: data.trabalho.titulo
          });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        expect(res.body.titulo).to.equal(data.trabalho.titulo);
        expect(res.body.status).to.equal('entregue');
      });
    });
  });
});