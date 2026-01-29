const XLSX = require('xlsx');

/**
 * Classe responsável por processar dados de planilhas Excel
 * e convertê-los no formato adequado para o algoritmo genético
 */
class DataProcessor {
  constructor() {
    this.disciplinasMap = new Map();
    this.alunosMap = new Map();
  }

  /**
   * Processar planilha Excel com dados de reprovações
   * @param {string} filePath - Caminho para o arquivo Excel
   * @returns {Object} - Dados processados (disciplinas e alunos)
   */
  async processarPlanilha(filePath) {
    try {
      // Ler arquivo Excel
      const workbook = XLSX.readFile(filePath);

      // Verificar se existe a planilha "Pendencias 2021" ou similar
      let sheetName = this.encontrarPlanilhaPendencias(workbook.SheetNames);

      if (!sheetName) {
        // Se não encontrar, usar a primeira planilha
        sheetName = workbook.SheetNames[0];
      }

      // Criar mapa de Ingressos da Planilha1 (Metadados)
      const mapaIngresso = this.criarMapaIngresso(workbook);

      const worksheet = workbook.Sheets[sheetName];
      const dados = XLSX.utils.sheet_to_json(worksheet);

      if (!dados || dados.length === 0) {
        throw new Error('Planilha vazia ou sem dados válidos');
      }

      // Processar dados
      const { disciplinas, alunos } = this.processarDados(dados, mapaIngresso);

      return {
        disciplinas: this.ordenarDisciplinas(disciplinas),
        alunos: this.filtrarAlunosComReprovacoes(alunos)
      };

    } catch (error) {
      throw new Error(`Erro ao processar planilha: ${error.message}`);
    }
  }

  /**
   * Encontrar planilha com dados de pendências
   */
  encontrarPlanilhaPendencias(sheetNames) {
    const possiveisNomes = [
      'Pendencias 2021',
      'Pendências 2021',
      'Pendencias',
      'Pendências',
      'Reprovacoes',
      'Reprovações'
    ];

    return sheetNames.find(name =>
      possiveisNomes.some(possivel =>
        name.toLowerCase().includes(possivel.toLowerCase())
      )
    );
  }

  /**
   * Criar mapa de Matricula -> Ano Ingresso a partir da primeira planilha (Metadados)
   */
  criarMapaIngresso(workbook) {
    const mapa = new Map();
    try {
      // Assumindo que a primeira planilha tem os metadados (Planilha1)
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const dados = XLSX.utils.sheet_to_json(sheet);

      dados.forEach(linha => {
        const matricula = this.extrairMatricula(linha);
        const ingresso = this.extrairIngresso(linha);
        if (matricula && ingresso) {
          mapa.set(matricula, ingresso);
        }
      });
    } catch (e) {
      console.warn('Erro ao criar mapa de ingressos:', e.message);
    }
    return mapa;
  }

  /**
   * Processar dados brutos da planilha
   */
  processarDados(dados, mapaIngresso = new Map()) {
    const disciplinasSet = new Set();
    const alunos = [];

    dados.forEach((linha, index) => {
      if (index === 0) console.log('DEBUG KEYS:', Object.keys(linha));
      try {
        // Extrair dados do aluno
        const matricula = this.extrairMatricula(linha);
        const nome = this.extrairNome(linha);
        const polo = this.extrairPolo(linha);

        // Tentar extrair ingresso da linha atual ou do mapa
        let anoIngresso = this.extrairIngresso(linha);
        if (!anoIngresso && mapaIngresso.has(matricula)) {
          anoIngresso = mapaIngresso.get(matricula);
        }

        if (!matricula || !nome) {
          console.warn(`Linha ${index + 1}: Dados incompletos (matrícula ou nome faltando)`);
          return;
        }

        // Encontrar disciplinas reprovadas (marcadas com "X")
        const disciplinasReprovadas = [];

        Object.keys(linha).forEach(coluna => {
          if (this.isDisciplinaColuna(coluna) && this.isReprovacao(linha[coluna])) {
            const codigo = this.extrairCodigoDisciplina(coluna);
            const nome = this.extrairNomeDisciplina(coluna);

            disciplinasReprovadas.push(codigo);

            // Adicionar disciplina ao conjunto global
            disciplinasSet.add(JSON.stringify({
              codigo,
              nome,
              posicaoNaGrade: this.extrairPosicaoNaGrade(codigo)
            }));
          }
        });

        // Adicionar aluno apenas se tiver reprovações
        if (disciplinasReprovadas.length > 0) {
          alunos.push({
            matricula,
            nome,
            polo,
            disciplinasReprovadas,
            totalReprovacoes: disciplinasReprovadas.length,
            totalReprovacoes: disciplinasReprovadas.length,
            capacidadePorSemestre: this.calcularCapacidadeAluno(disciplinasReprovadas.length, anoIngresso)
          });
        }

      } catch (error) {
        console.warn(`Erro ao processar linha ${index + 1}: ${error.message}`);
      }
    });

    // Converter disciplinas de volta para array de objetos
    const disciplinas = Array.from(disciplinasSet).map(d => {
      const disciplina = JSON.parse(d);
      return {
        ...disciplina,
        alunosReprovados: alunos.filter(aluno =>
          aluno.disciplinasReprovadas.includes(disciplina.codigo)
        ).length,
        semestre: Math.ceil(disciplina.posicaoNaGrade / 5) || 1
      };
    });

    return { disciplinas, alunos };
  }

  /**
   * Extrair ano de ingresso do aluno
   */
  extrairIngresso(linha) {
    const possiveisChaves = ['Ingresso', 'INGRESSO', 'Ano Ingresso', 'Inicio'];

    // Tentativa exata
    for (const chave of possiveisChaves) {
      if (linha[chave]) {
        return String(linha[chave]).trim();
      }
    }

    // Tentativa fuzzy (case insensitive)
    const chaves = Object.keys(linha);
    for (const chave of chaves) {
      if (chave.toLowerCase().includes('ingresso')) {
        return String(linha[chave]).trim();
      }
    }

    return null;
  }

  /**
   * Extrair matrícula do aluno
   */
  extrairMatricula(linha) {
    const possiveisChaves = ['Matrícula', 'Matricula', 'MATRICULA', 'MATRÍCULA'];

    for (const chave of possiveisChaves) {
      if (linha[chave] !== undefined && linha[chave] !== null) {
        return String(linha[chave]).trim();
      }
    }

    return null;
  }

  /**
   * Extrair nome do aluno
   */
  extrairNome(linha) {
    const possiveisChaves = ['Nome', 'NOME', 'nome', 'Discente'];

    for (const chave of possiveisChaves) {
      if (linha[chave] && typeof linha[chave] === 'string') {
        return linha[chave].trim();
      }
    }

    return null;
  }

  /**
   * Extrair polo do aluno
   */
  extrairPolo(linha) {
    const possiveisChaves = ['Polo', 'POLO', 'polo'];

    for (const chave of possiveisChaves) {
      if (linha[chave] && typeof linha[chave] === 'string') {
        return linha[chave].trim();
      }
    }

    return 'Não informado';
  }

  /**
   * Verificar se uma coluna representa uma disciplina
   */
  isDisciplinaColuna(nomeColuna) {
    return nomeColuna && nomeColuna.includes('CCCD');
  }

  /**
   * Verificar se o valor indica reprovação
   */
  isReprovacao(valor) {
    return valor === 'X' || valor === 'x' || valor === 1 || valor === '1';
  }

  /**
   * Extrair código da disciplina
   */
  extrairCodigoDisciplina(nomeColuna) {
    const match = nomeColuna.match(/CCCD\d+/);
    return match ? match[0] : nomeColuna;
  }

  /**
   * Extrair nome da disciplina
   */
  extrairNomeDisciplina(nomeColuna) {
    const partes = nomeColuna.split(' - ');
    return partes.length > 1 ? partes[1].trim() : nomeColuna;
  }

  /**
   * Extrair posição na grade curricular
   */
  extrairPosicaoNaGrade(codigo) {
    const match = codigo.match(/CCCD(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Calcular capacidade do aluno cursar disciplinas por semestre
   */
  /**
   * Calcular capacidade do aluno cursar disciplinas por semestre
   * Baseado no tempo restante para conclusão e urgência de formatura
   */
  calcularCapacidadeAluno(totalReprovacoes, anoIngresso) {
    if (!anoIngresso) return 5; // Fallback para padrão se não tiver data

    // Definir semestre atual (Idealmente viria de parâmetro, mas vamos assumir data atual ou recente)
    // Para compatibilidade com TCC/Dados antigos, vamos assumir 2026.1 como "hoje" ou usar Date
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    const semestreAtual = parseFloat(`${anoAtual}.${mesAtual > 6 ? 2 : 1}`);

    const prazoMaximoCurso = 8; // Duração padrão do curso em anos (ou semestres? O código original usava semestres=8? Não, TCC diz 4 anos. Vamos usar semestres.)
    // Vamos trabalhar em semestres para precisão

    // Converter "2017.2" para número de semestres absolutos
    const getSemestresAbsolutos = (semestreStr) => {
      const [ano, sem] = String(semestreStr).split('.').map(Number);
      return (ano * 2) + (sem === 2 ? 1 : 0);
    };

    const semestresPercorridos = getSemestresAbsolutos(semestreAtual) - getSemestresAbsolutos(anoIngresso);

    // Assumindo prazo máximo de retenção de 1.5x o tempo (4 anos = 8 semestres -> Max 12 semestres)
    // Ou simplesmente baseando no objetivo de formar em 8 semestres?
    // O TCC diz "tempo restante para conclusão". Se ele entrou em 2017.2 e estamos em 2026.1, ele já estourou.
    // Vamos assumir que o "tempo restante" é o que falta para completar o currículo MÍNIMO ou o prazo de jubilação?
    // Vou usar a lógica de "Reta Final" pedida:

    // Estimativa de semestres restantes baseado em um prazo limite de ~12 semestres (6 anos)
    const PRAZO_JUBILACAO = 14; // 7 anos com margem
    let tempoRestante = Math.max(1, PRAZO_JUBILACAO - semestresPercorridos);

    // Lógica Adaptativa
    let capacidadeMaxima = 6; // Padrão ligeiramente maior que 5

    // Se estiver na reta final (menos de 1 ano para jubilar ou formar)
    if (tempoRestante <= 2) {
      capacidadeMaxima = 8; // "Gás final"
    } else if (tempoRestante <= 4) {
      capacidadeMaxima = 7;
    }

    const capacidadeCalculada = Math.ceil(totalReprovacoes / tempoRestante);

    return Math.min(capacidadeCalculada, capacidadeMaxima);
  }

  /**
   * Ordenar disciplinas por número de alunos reprovados
   */
  ordenarDisciplinas(disciplinas) {
    return disciplinas.sort((a, b) => {
      // Primeiro por número de alunos reprovados (decrescente)
      if (b.alunosReprovados !== a.alunosReprovados) {
        return b.alunosReprovados - a.alunosReprovados;
      }
      // Em caso de empate, por posição na grade (crescente)
      return a.posicaoNaGrade - b.posicaoNaGrade;
    });
  }

  /**
   * Filtrar apenas alunos que têm reprovações
   */
  filtrarAlunosComReprovacoes(alunos) {
    return alunos
      .filter(aluno => aluno.totalReprovacoes > 0)
      .sort((a, b) => b.totalReprovacoes - a.totalReprovacoes);
  }

  /**
   * Validar dados processados
   */
  validarDados(dados) {
    const { disciplinas, alunos } = dados;

    if (!disciplinas || disciplinas.length === 0) {
      throw new Error('Nenhuma disciplina foi encontrada nos dados');
    }

    if (!alunos || alunos.length === 0) {
      throw new Error('Nenhum aluno com reprovações foi encontrado nos dados');
    }

    // Verificar se pelo menos uma disciplina tem alunos reprovados
    const disciplinasComReprovacoes = disciplinas.filter(d => d.alunosReprovados > 0);
    if (disciplinasComReprovacoes.length === 0) {
      throw new Error('Nenhuma disciplina com reprovações foi encontrada');
    }

    return true;
  }

  /**
   * Gerar estatísticas dos dados processados
   */
  gerarEstatisticas(dados) {
    const { disciplinas, alunos } = dados;

    const stats = {
      totalDisciplinas: disciplinas.length,
      totalAlunos: alunos.length,
      disciplinasComReprovacoes: disciplinas.filter(d => d.alunosReprovados > 0).length,
      mediaReprovacoesPorAluno: alunos.reduce((sum, a) => sum + a.totalReprovacoes, 0) / alunos.length,
      disciplinaMaisReprovada: disciplinas[0], // Já ordenado por número de reprovações
      alunoComMaisReprovacoes: alunos[0] // Já ordenado por número de reprovações
    };

    return stats;
  }
}

module.exports = DataProcessor;