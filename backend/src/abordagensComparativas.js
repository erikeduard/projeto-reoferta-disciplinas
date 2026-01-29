/**
 * Implementação das Abordagens Comparativas
 * Para validação do Algoritmo Genético no TCC
 * 
 * Este arquivo contém duas abordagens alternativas:
 * 1. Prioridade Simples - Seleciona as N disciplinas com mais reprovações
 * 2. Seleção Aleatória - Seleciona N disciplinas aleatoriamente
 */

class AbordagensComparativas {
  constructor(parametros = {}) {
    this.MAX_DISCIPLINAS_REOFERTA = parametros.maxDisciplinasReoferta || 10;
    this.NUM_SIMULACOES_ALEATORIAS = parametros.numSimulacoesAleatorias || 100;

    // Pesos da função de aptidão (devem corresponder ao AG)
    this.PESO_ALUNOS_BENEFICIADOS = parametros.pesoAlunosBeneficiados || 100;
    this.PESO_DISCIPLINAS_ATENDIDAS = parametros.pesoDisciplinasAtendidas || 1;
  }

  /**
   * ABORDAGEM 1: PRIORIDADE SIMPLES
   * Seleciona as N disciplinas com maior número de alunos reprovados
   * 
   * @param {Object} dados - Dados processados (disciplinas e alunos)
   * @returns {Object} - Resultado da seleção
   */
  prioridadeSimples(dados) {
    const { disciplinas, alunos } = dados;

    // Ordenar disciplinas por número de alunos reprovados (decrescente)
    const disciplinasOrdenadas = [...disciplinas].sort(
      (a, b) => b.alunosReprovados - a.alunosReprovados
    );

    // Selecionar as top N disciplinas
    const disciplinasSelecionadas = disciplinasOrdenadas
      .slice(0, this.MAX_DISCIPLINAS_REOFERTA);

    // Calcular métricas usando a mesma lógica do AG
    const resultado = this.calcularMetricas(disciplinasSelecionadas, alunos);

    return {
      abordagem: 'Prioridade Simples',
      descricao: `Seleciona as ${this.MAX_DISCIPLINAS_REOFERTA} disciplinas com mais reprovações`,
      disciplinasSelecionadas,
      ...resultado
    };
  }

  /**
   * ABORDAGEM 2: SELEÇÃO ALEATÓRIA
   * Seleciona N disciplinas aleatoriamente e calcula a média de múltiplas simulações
   * 
   * @param {Object} dados - Dados processados (disciplinas e alunos)
   * @returns {Object} - Resultado médio das simulações
   */
  selecaoAleatoria(dados) {
    const { disciplinas, alunos } = dados;

    // Filtrar disciplinas com pelo menos 1 reprovação
    const disciplinasComReprovacoes = disciplinas.filter(d => d.alunosReprovados > 0);

    const resultadosSimulacoes = [];

    // Executar múltiplas simulações
    for (let i = 0; i < this.NUM_SIMULACOES_ALEATORIAS; i++) {
      // Selecionar N disciplinas aleatoriamente
      const disciplinasEmbaralhadas = this.embaralharArray([...disciplinasComReprovacoes]);
      const disciplinasSelecionadas = disciplinasEmbaralhadas
        .slice(0, this.MAX_DISCIPLINAS_REOFERTA);

      // Calcular métricas desta simulação
      const resultado = this.calcularMetricas(disciplinasSelecionadas, alunos);
      resultadosSimulacoes.push({
        simulacao: i + 1,
        disciplinasSelecionadas,
        ...resultado
      });
    }

    // Calcular estatísticas
    const estatisticas = this.calcularEstatisticasSimulacoes(resultadosSimulacoes);

    // Encontrar melhor e pior simulação
    const melhorSimulacao = resultadosSimulacoes.reduce((best, curr) =>
      curr.aptidao > best.aptidao ? curr : best
    );
    const piorSimulacao = resultadosSimulacoes.reduce((worst, curr) =>
      curr.aptidao < worst.aptidao ? curr : worst
    );

    return {
      abordagem: 'Seleção Aleatória',
      descricao: `Média de ${this.NUM_SIMULACOES_ALEATORIAS} seleções aleatórias de ${this.MAX_DISCIPLINAS_REOFERTA} disciplinas`,
      estatisticas,
      melhorSimulacao,
      piorSimulacao,
      todasSimulacoes: resultadosSimulacoes
    };
  }

  /**
   * Calcular métricas de uma seleção de disciplinas
   * (Mesma lógica do avaliarAptidao do AlgoritmoGenetico)
   */
  calcularMetricas(disciplinasSelecionadas, alunos) {
    const codigosSelecionados = disciplinasSelecionadas.map(d => d.codigo);

    let alunosBeneficiados = 0;
    let totalDisciplinasAtendidas = 0;
    const detalhesPorAluno = [];

    alunos.forEach(aluno => {
      // Disciplinas que o aluno reprovou E estão sendo reofertadas
      const disciplinasAtendidas = aluno.disciplinasReprovadas.filter(codigo =>
        codigosSelecionados.includes(codigo)
      );

      // Respeitar capacidade do aluno
      const numDisciplinasAtendidas = Math.min(
        disciplinasAtendidas.length,
        aluno.capacidadePorSemestre || 5
      );

      if (numDisciplinasAtendidas > 0) {
        alunosBeneficiados++;
        totalDisciplinasAtendidas += numDisciplinasAtendidas;
      }

      detalhesPorAluno.push({
        matricula: aluno.matricula,
        nome: aluno.nome,
        totalReprovacoes: aluno.totalReprovacoes,
        disciplinasAtendidas: disciplinasAtendidas.length,
        disciplinasAtendidasCapacidade: numDisciplinasAtendidas
      });
    });

    // Calcular aptidão (mesma fórmula do AG)
    const aptidao = (alunosBeneficiados * this.PESO_ALUNOS_BENEFICIADOS) +
      (totalDisciplinasAtendidas * this.PESO_DISCIPLINAS_ATENDIDAS);

    return {
      alunosBeneficiados,
      totalDisciplinasAtendidas,
      aptidao,
      percentualCobertura: ((alunosBeneficiados / alunos.length) * 100).toFixed(1),
      numDisciplinasReofertadas: disciplinasSelecionadas.length,
      detalhesPorAluno
    };
  }

  /**
   * Calcular estatísticas das simulações aleatórias
   */
  calcularEstatisticasSimulacoes(simulacoes) {
    const alunos = simulacoes.map(s => s.alunosBeneficiados);
    const disciplinas = simulacoes.map(s => s.totalDisciplinasAtendidas);
    const aptidoes = simulacoes.map(s => s.aptidao);

    return {
      alunosBeneficiados: {
        media: this.media(alunos).toFixed(1),
        minimo: Math.min(...alunos),
        maximo: Math.max(...alunos),
        desvioPadrao: this.desvioPadrao(alunos).toFixed(2)
      },
      disciplinasAtendidas: {
        media: this.media(disciplinas).toFixed(1),
        minimo: Math.min(...disciplinas),
        maximo: Math.max(...disciplinas),
        desvioPadrao: this.desvioPadrao(disciplinas).toFixed(2)
      },
      aptidao: {
        media: this.media(aptidoes).toFixed(1),
        minimo: Math.min(...aptidoes),
        maximo: Math.max(...aptidoes),
        desvioPadrao: this.desvioPadrao(aptidoes).toFixed(2)
      }
    };
  }

  /**
   * Embaralhar array (Fisher-Yates shuffle)
   */
  embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Calcular média
   */
  media(valores) {
    return valores.reduce((sum, v) => sum + v, 0) / valores.length;
  }

  /**
   * Calcular desvio padrão
   */
  desvioPadrao(valores) {
    const med = this.media(valores);
    const somaQuadrados = valores.reduce((sum, v) => sum + Math.pow(v - med, 2), 0);
    return Math.sqrt(somaQuadrados / valores.length);
  }

  /**
   * Executar comparação completa das 3 abordagens
   * @param {Object} dados - Dados processados
   * @param {Object} resultadoAG - Resultado do Algoritmo Genético
   * @returns {Object} - Comparação das 3 abordagens
   */
  compararAbordagens(dados, resultadoAG) {
    const resultadoPS = this.prioridadeSimples(dados);
    const resultadoAleatorio = this.selecaoAleatoria(dados);

    return {
      algoritmoGenetico: {
        alunos: resultadoAG.melhorAptidao.alunosBeneficiados,
        percentual: ((resultadoAG.melhorAptidao.alunosBeneficiados / dados.alunos.length) * 100).toFixed(0),
        disciplinasAtendidas: resultadoAG.melhorAptidao.totalDisciplinasAtendidas,
        aptidao: resultadoAG.melhorAptidao.aptidao
      },
      prioridadeSimples: {
        alunos: resultadoPS.alunosBeneficiados,
        percentual: resultadoPS.percentualCobertura,
        disciplinasAtendidas: resultadoPS.totalDisciplinasAtendidas,
        aptidao: resultadoPS.aptidao
      },
      aleatorio: {
        alunos: parseFloat(resultadoAleatorio.estatisticas.alunosBeneficiados.media),
        percentual: ((parseFloat(resultadoAleatorio.estatisticas.alunosBeneficiados.media) / dados.alunos.length) * 100).toFixed(0),
        disciplinasAtendidas: parseFloat(resultadoAleatorio.estatisticas.disciplinasAtendidas.media),
        aptidao: parseFloat(resultadoAleatorio.estatisticas.aptidao.media)
      },
      detalhes: {
        prioridadeSimples: resultadoPS,
        aleatorio: resultadoAleatorio
      }
    };
  }
}

module.exports = AbordagensComparativas;


// ============================================
// EXEMPLO DE USO
// ============================================
/*
const DataProcessor = require('./dataProcessor');
const AlgoritmoGenetico = require('./algoritmoGenetico');
const AbordagensComparativas = require('./abordagensComparativas');

async function executarComparacao() {
  // Processar dados
  const processor = new DataProcessor();
  const dados = await processor.processarPlanilha('caminho/para/planilha.xlsx');

  // Executar Algoritmo Genético
  const ag = new AlgoritmoGenetico();
  const resultadoAG = await ag.executar(dados);

  // Comparar com outras abordagens
  const comparador = new AbordagensComparativas();
  const comparacao = comparador.compararAbordagens(dados, resultadoAG);

  console.log('=== COMPARAÇÃO DAS ABORDAGENS ===');
  console.table([
    { 
      Abordagem: 'Algoritmo Genético', 
      Alunos: comparacao.algoritmoGenetico.alunos,
      '% Cobertura': comparacao.algoritmoGenetico.percentual + '%',
      'Disc. Atendidas': comparacao.algoritmoGenetico.disciplinasAtendidas
    },
    { 
      Abordagem: 'Prioridade Simples', 
      Alunos: comparacao.prioridadeSimples.alunos,
      '% Cobertura': comparacao.prioridadeSimples.percentual + '%',
      'Disc. Atendidas': comparacao.prioridadeSimples.disciplinasAtendidas
    },
    { 
      Abordagem: 'Aleatória (média)', 
      Alunos: comparacao.aleatorio.alunos.toFixed(0),
      '% Cobertura': comparacao.aleatorio.percentual + '%',
      'Disc. Atendidas': comparacao.aleatorio.disciplinasAtendidas.toFixed(0)
    }
  ]);

  return comparacao;
}

executarComparacao();
*/
