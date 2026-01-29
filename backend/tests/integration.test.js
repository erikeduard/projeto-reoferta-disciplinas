const request = require('supertest');
const app = require('../server');
const fs = require('fs').promises;
const path = require('path');

describe('API Tests', () => {
    let testFilePath;
    let testFileName = 'test_planilha.xlsx';

    beforeAll(async () => {
        // Create a dummy file if it doesn't exist for testing upload (mocking might be better but this is integration)
        // For now, let's assume we can hit the endpoint if we mock the processing or use an existing file if we knew one.
        // Since we don't have a guarantee of a file, we will mock the DataProcessor and AlgoritmoGenetico in a real unit test
        // But here we are writing a system test.
        // Let's rely on server.js having error handling if file doesn't exist.
    });

    test('POST /api/comparar should return 400 if filename is missing', async () => {
        const res = await request(app)
            .post('/api/comparar')
            .send({});
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Nome do arquivo é obrigatório');
    });

    test('POST /api/comparar should return 404 if file does not exist', async () => {
        const res = await request(app)
            .post('/api/comparar')
            .send({ filename: 'nonexistent.xlsx' });
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('error', 'Arquivo não encontrado');
    });
});
