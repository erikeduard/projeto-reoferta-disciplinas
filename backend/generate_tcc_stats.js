const DataProcessor = require('./src/dataProcessor');
const AlgoritmoGenetico = require('./src/algoritmoGenetico');
const path = require('path');

async function runStats() {
    try {
        const processor = new DataProcessor();
        // Adjust path to where the file is (root)
        const dados = await processor.processarPlanilha('../Análise de reprovações.xlsx');

        console.log(`Total Alunos com Reprovações: ${dados.alunos.length}`);

        // Calcular distribuição de capacidades
        const distribuicaoCapacidade = {};
        dados.alunos.forEach((aluno, idx) => {
            const cap = aluno.capacidadePorSemestre;
            distribuicaoCapacidade[cap] = (distribuicaoCapacidade[cap] || 0) + 1;

            if (idx < 5) {
                console.log(`Aluno ${idx}: Ingresso=${aluno.anoIngresso} (Wait, did I save it?), TotalReprov=${aluno.totalReprovacoes}, Cap=${cap}`);
                // I suspect I didn't save 'anoIngresso' in the final object array in 'processarDados', only passed it to calculation.
                // But I can check logic anyway.
            }
        });

        console.log('\n--- Distribuição de Capacidade (Novo Modelo) ---');
        Object.keys(distribuicaoCapacidade).sort((a, b) => a - b).forEach(cap => {
            const count = distribuicaoCapacidade[cap];
            const percent = ((count / dados.alunos.length) * 100).toFixed(1);
            console.log(`Capacidade ${cap}: ${count} alunos (${percent}%)`);
        });

        // Executar AG para ver impacto nos beneficiados
        const ag = new AlgoritmoGenetico({
            maxDisciplinasReoferta: 10,
            tamanhoPopulacao: 100,
            maxGeracoes: 50
        });
        const resultado = await ag.executar(dados);

        console.log('\n--- Resultados da Otimização ---');
        console.log(`Alunos Beneficiados: ${resultado.melhorAptidao.alunosBeneficiados} (${((resultado.melhorAptidao.alunosBeneficiados / dados.alunos.length) * 100).toFixed(1)}%)`);
        console.log(`Média Disciplinas/Aluno: ${(resultado.melhorAptidao.totalDisciplinasAtendidas / resultado.melhorAptidao.alunosBeneficiados).toFixed(2)}`);

        // Debug output
        console.log('\n--- DEBUG ESTATISTICAS NO RESULTADO ---');
        console.log('Chaves em estatisticas:', Object.keys(resultado.estatisticas));
        console.log('Distribuicao retornada:', resultado.estatisticas.distribuicaoCapacidade);
    } catch (error) {
        console.error("Erro:", error);
    }
}

runStats();
