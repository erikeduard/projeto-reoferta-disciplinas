const DataProcessor = require('../src/dataProcessor');

describe('DataProcessor Consistency Tests', () => {
    let processor;

    beforeEach(() => {
        processor = new DataProcessor();
    });

    test('deve extrair ano de ingresso corretamente', () => {
        const linha = {
            'Matricula': '2017001',
            'Nome': 'Teste',
            'Ingresso': '2017.2'
        };
        expect(processor.extrairIngresso(linha)).toBe('2017.2');
    });

    test('deve calcular capacidade maxima de 8 para alunos em reta final (urgencia)', () => {
        // Ingresso 2018.1 -> Para 2026.1 são 8 anos = 16 semestres percorridos.
        // Prazo calculo: 14 - 16 = -2. Tempo Restante <= 2.
        // Capacidade deve ser 8.
        const capacidade = processor.calcularCapacidadeAluno(10, '2018.1');

        // Logica: teto=8. Reprovacoes=10. TempoRestante ~ 1 (min). Ceil(10/1) = 10. Min(10, 8) = 8.
        expect(capacidade).toBe(8);
    });

    test('deve calcular capacidade padrao (6) para alunos novos', () => {
        // Ingresso 2025.1 -> Para 2026.1 são 2 semestres.
        // Prazo: 14 - 2 = 12. Tempo restante > 4.
        // Capacidade deve ser 6.
        const capacidade = processor.calcularCapacidadeAluno(10, '2025.1');

        // Logica: teto=6. Reprovacoes=10. TempoRestante=12. Ceil(10/12) = 1. Min(1, 6) = 1.
        // Ops, para reprovacoes baixas, a capacidade de carga eh baixa.
        // Vamos testar com MUITAS reprovacoes para forcar o teto.

        const capacidadeTeto = processor.calcularCapacidadeAluno(50, '2025.1');
        // Reprovacoes=50. TempoRestante=12. Ceil(50/12) = 5. Min(5, 6) = 5.
        // Ainda abaixo do teto.

        const capacidadeTeto2 = processor.calcularCapacidadeAluno(80, '2025.1');
        // Ceil(80/12) = 7. Min(7, 6) = 6.
        expect(capacidadeTeto2).toBe(6);
    });

    test('deve calcular capacidade intermediaria (7) para alunos meio curso', () => {
        // Ingresso 2021.1 -> Para 2026.1 são 5 anos = 10 semestres.
        // Prazo: 14 - 10 = 4. Tempo restante <= 4.
        // Capacidade deve ser 7.
        const capacidade = processor.calcularCapacidadeAluno(80, '2021.1');
        expect(capacidade).toBe(7);
    });
});
