/**
 * Implementação do Algoritmo Genético para Otimização de Reoferta de Disciplinas
 * Baseado no problema da mochila
 */
class AlgoritmoGenetico {
  constructor(parametros = {}) {
    // Parâmetros padrão do algoritmo genético
    this.TAMANHO_POPULACAO = parametros.tamanhoPopulacao || 100;
    this.MAX_GERACOES = parametros.maxGeracoes || 50;
    this.TAXA_CROSSOVER = parametros.taxaCrossover || 0.8;
    this.TAXA_MUTACAO = parametros.taxaMutacao || 0.2;
    this.MAX_DISCIPLINAS_REOFERTA = parametros.maxDisciplinasReoferta || 10;
    
    // Pesos da função de aptidão
    this.PESO_ALUNOS_BENEFICIADOS = parametros.pesoAlunosBeneficiados || 100;
    this.PESO_DISCIPLINAS_ATENDIDAS = parametros.pesoDisciplinasAtendidas || 1;
    this.PENALIZACAO_EXCESSO = parametros.penalizacaoExcesso || 1000;
    
    // Controle de logs
    this.verbose = parametros.verbose || false;
    
    // Histórico da evolução
    this.historico = [];
  }

  /**
   * Função principal para executar o algoritmo genético
   * @param {Object} dados - Dados processados (disciplinas e alunos)
   * @returns {Object} - Resultado da otimização
   */
  async executar(dados) {
    const { disciplinas, alunos } = dados;
    
    if (!disciplinas || !alunos || disciplinas.length === 0 || alunos.length === 0) {
      throw new Error('Dados inválidos: disciplinas e alunos são obrigatórios');
    }
    
    this.log(`Iniciando algoritmo genético com ${alunos.length} alunos e ${disciplinas.length} disciplinas`);
    
    // Inicializar população
    let populacao = this.inicializarPopulacao(disciplinas.length);
    let melhorSolucao = null;
    let melhorAptidao = { aptidao: -Infinity };
    
    // Limpar histórico
    this.historico = [];
    
    // Loop principal do algoritmo genético
    for (let geracao = 0; geracao < this.MAX_GERACOES; geracao++) {
      // Avaliar aptidão de cada indivíduo
      const aptidoes = populacao.map(individuo => 
        this.avaliarAptidao(individuo, disciplinas, alunos)
      );
      
      // Encontrar o melhor indivíduo desta geração
      const indiceMelhor = aptidoes.reduce((iMax, aptidao, i, arr) => 
        aptidao.aptidao > arr[iMax].aptidao ? i : iMax, 0
      );
      
      // Atualizar melhor solução global
      if (aptidoes[indiceMelhor].aptidao > melhorAptidao.aptidao) {
        melhorSolucao = [...populacao[indiceMelhor]];
        melhorAptidao = { ...aptidoes[indiceMelhor] };
      }
      
      // Registrar histórico
      const mediaAptidao = aptidoes.reduce((sum, apt) => sum + apt.aptidao, 0) / aptidoes.length;
      this.historico.push({
        geracao: geracao + 1,
        melhorAptidao: melhorAptidao.aptidao,
        mediaAptidao,
        alunosBeneficiados: melhorAptidao.alunosBeneficiados,
        disciplinasReofertadas: melhorAptidao.numDisciplinasReofertadas
      });
      
      // Log de progresso
      if (geracao % 10 === 0 || geracao === this.MAX_GERACOES - 1) {
        this.log(`Geração ${geracao + 1}: Aptidão=${melhorAptidao.aptidao}, Alunos=${melhorAptidao.alunosBeneficiados}/${alunos.length}`);
      }
      
      // Criar nova população
      const novaPopulacao = [];
      
      // Elitismo: manter os melhores indivíduos
      const numElites = Math.floor(this.TAMANHO_POPULACAO * 0.1); // 10% da população
      const indicesOrdenados = aptidoes
        .map((apt, index) => ({ apt: apt.aptidao, index }))
        .sort((a, b) => b.apt - a.apt);
      
      for (let i = 0; i < numElites; i++) {
        novaPopulacao.push([...populacao[indicesOrdenados[i].index]]);
      }
      
      // Completar população com novos indivíduos
      while (novaPopulacao.length < this.TAMANHO_POPULACAO) {
        // Seleção dos pais
        const pai1 = this.selecaoTorneio(populacao, aptidoes);
        const pai2 = this.selecaoTorneio(populacao, aptidoes);
        
        // Crossover
        let [filho1, filho2] = this.crossover(pai1, pai2);
        
        // Mutação
        filho1 = this.mutacao(filho1);
        filho2 = this.mutacao(filho2);
        
        // Adicionar filhos à nova população
        novaPopulacao.push(filho1);
        if (novaPopulacao.length < this.TAMANHO_POPULACAO) {
          novaPopulacao.push(filho2);
        }
      }
      
      // Atualizar população
      populacao = novaPopulacao;
    }
    
    // Calcular estatísticas finais
    const estatisticas = this.calcularEstatisticas(melhorAptidao, disciplinas, alunos);
    
    this.log(`Otimização concluída: ${melhorAptidao.alunosBeneficiados}/${alunos.length} alunos beneficiados`);
    
    return {
      melhorSolucao,
      melhorAptidao,
      disciplinasReofertadas: this.extrairDisciplinasReofertadas(melhorSolucao, disciplinas),
      estatisticas,
      historico: this.historico,
      parametros: {
        tamanhoPopulacao: this.TAMANHO_POPULACAO,
        maxGeracoes: this.MAX_GERACOES,
        taxaCrossover: this.TAXA_CROSSOVER,
        taxaMutacao: this.TAXA_MUTACAO,
        maxDisciplinasReoferta: this.MAX_DISCIPLINAS_REOFERTA
      }
    };
  }

  /**
   * Inicializar população aleatória
   */
  inicializarPopulacao(numDisciplinas) {
    const populacao = [];
    
    for (let i = 0; i < this.TAMANHO_POPULACAO; i++) {
      const individuo = Array(numDisciplinas).fill(0);
      const numDisciplinasReofertar = Math.floor(Math.random() * (this.MAX_DISCIPLINAS_REOFERTA + 1));
      const indices = [...Array(numDisciplinas).keys()];
      
      // Embaralhar índices
      for (let j = indices.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [indices[j], indices[k]] = [indices[k], indices[j]];
      }
      
      // Selecionar disciplinas aleatoriamente
      for (let j = 0; j < numDisciplinasReofertar; j++) {
        individuo[indices[j]] = 1;
      }
      
      populacao.push(individuo);
    }
    
    return populacao;
  }

  /**
   * Avaliar aptidão de um indivíduo
   */
  avaliarAptidao(individuo, disciplinas, alunos) {
    // Mapear disciplinas selecionadas
    const disciplinasReofertadas = individuo
      .map((gene, index) => gene === 1 ? disciplinas[index].codigo : null)
      .filter(Boolean);
    
    // Calcular benefícios
    let alunosBeneficiados = 0;
    let totalDisciplinasAtendidas = 0;
    const detalhesPorAluno = [];
    
    alunos.forEach(aluno => {
      const disciplinasAtendidas = aluno.disciplinasReprovadas.filter(codigo => 
        disciplinasReofertadas.includes(codigo)
      );
      
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
    
    // Penalização por exceder limite
    const numDisciplinasReofertadas = disciplinasReofertadas.length;
    const penalizacao = numDisciplinasReofertadas > this.MAX_DISCIPLINAS_REOFERTA 
      ? (numDisciplinasReofertadas - this.MAX_DISCIPLINAS_REOFERTA) * this.PENALIZACAO_EXCESSO
      : 0;
    
    // Calcular aptidão final
    const aptidao = (alunosBeneficiados * this.PESO_ALUNOS_BENEFICIADOS) + 
                   (totalDisciplinasAtendidas * this.PESO_DISCIPLINAS_ATENDIDAS) - 
                   penalizacao;
    
    return {
      aptidao,
      alunosBeneficiados,
      totalDisciplinasAtendidas,
      numDisciplinasReofertadas,
      disciplinasReofertadas,
      detalhesPorAluno
    };
  }

  /**
   * Seleção por torneio
   */
  selecaoTorneio(populacao, aptidoes, tamanhoTorneio = 3) {
    let melhorIndice = Math.floor(Math.random() * populacao.length);
    
    for (let i = 1; i < tamanhoTorneio; i++) {
      const indiceAtual = Math.floor(Math.random() * populacao.length);
      if (aptidoes[indiceAtual].aptidao > aptidoes[melhorIndice].aptidao) {
        melhorIndice = indiceAtual;
      }
    }
    
    return [...populacao[melhorIndice]];
  }

  /**
   * Crossover de ponto único
   */
  crossover(pai1, pai2) {
    if (Math.random() > this.TAXA_CROSSOVER) {
      return [[...pai1], [...pai2]];
    }
    
    const pontoCorte = Math.floor(Math.random() * pai1.length);
    
    const filho1 = [...pai1.slice(0, pontoCorte), ...pai2.slice(pontoCorte)];
    const filho2 = [...pai2.slice(0, pontoCorte), ...pai1.slice(pontoCorte)];
    
    return [filho1, filho2];
  }

  /**
   * Mutação por inversão de bits
   */
  mutacao(individuo) {
    const resultado = [...individuo];
    
    for (let i = 0; i < resultado.length; i++) {
      if (Math.random() < this.TAXA_MUTACAO) {
        resultado[i] = resultado[i] === 0 ? 1 : 0;
      }
    }
    
    return resultado;
  }

  /**
   * Extrair disciplinas reofertadas de uma solução
   */
  extrairDisciplinasReofertadas(solucao, disciplinas) {
    return solucao
      .map((gene, index) => gene === 1 ? disciplinas[index] : null)
      .filter(Boolean);
  }

  /**
   * Calcular estatísticas detalhadas
   */
  calcularEstatisticas(melhorAptidao, disciplinas, alunos) {
    const disciplinasReofertadas = melhorAptidao.disciplinasReofertadas;
    
    // Estatísticas por semestre
    const disciplinasPorSemestre = {};
    disciplinasReofertadas.forEach(codigo => {
      const disciplina = disciplinas.find(d => d.codigo === codigo);
      if (disciplina) {
        const semestre = disciplina.semestre || Math.ceil(disciplina.posicaoNaGrade / 5);
        disciplinasPorSemestre[semestre] = (disciplinasPorSemestre[semestre] || 0) + 1;
      }
    });
    
    // Análise de impacto por perfil de aluno
    const perfisPorReprovacao = {
      "1-5": { total: 0, beneficiados: 0 },
      "6-10": { total: 0, beneficiados: 0 },
      "11-15": { total: 0, beneficiados: 0 },
      "16-20": { total: 0, beneficiados: 0 },
      "20+": { total: 0, beneficiados: 0 }
    };
    
    alunos.forEach(aluno => {
      let categoria;
      if (aluno.totalReprovacoes <= 5) categoria = "1-5";
      else if (aluno.totalReprovacoes <= 10) categoria = "6-10";
      else if (aluno.totalReprovacoes <= 15) categoria = "11-15";
      else if (aluno.totalReprovacoes <= 20) categoria = "16-20";
      else categoria = "20+";
      
      perfisPorReprovacao[categoria].total++;
      
      // Verificar se aluno é beneficiado
      const disciplinasAtendidas = aluno.disciplinasReprovadas.filter(codigo => 
        disciplinasReofertadas.includes(codigo)
      );
      
      if (disciplinasAtendidas.length > 0) {
        perfisPorReprovacao[categoria].beneficiados++;
      }
    });
    
    // Calcular eficiência
    const eficiencia = {
      percentualAlunosBeneficiados: (melhorAptidao.alunosBeneficiados / alunos.length * 100).toFixed(2),
      mediaDisciplinasPorAluno: (melhorAptidao.totalDisciplinasAtendidas / melhorAptidao.alunosBeneficiados).toFixed(2),
      mediaAlunosPorDisciplina: (melhorAptidao.alunosBeneficiados / disciplinasReofertadas.length).toFixed(2)
    };
    
    return {
      disciplinasPorSemestre,
      perfisPorReprovacao,
      eficiencia,
      resumo: {
        totalAlunos: alunos.length,
        alunosBeneficiados: melhorAptidao.alunosBeneficiados,
        disciplinasReofertadas: disciplinasReofertadas.length,
        disciplinasAtendidas: melhorAptidao.totalDisciplinasAtendidas
      }
    };
  }

  /**
   * Função auxiliar para logging
   */
  log(message) {
    if (this.verbose) {
      console.log(`[AG] ${new Date().toISOString()}: ${message}`);
    }
  }
}

module.exports = AlgoritmoGenetico;