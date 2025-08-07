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
      
      const worksheet = workbook.Sheets[sheetName];
      const dados = XLSX.utils.sheet_to_json(worksheet);
      
      if (!dados || dados.length === 0) {
        throw new Error('Planilha vazia ou sem dados válidos');
      }
      
      // Processar dados
      const { disciplinas, alunos } = this.processarDados(dados);
      
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
   * Processar dados brutos da planilha
   */
  processarDados(dados) {
    const disciplinasSet = new Set();
    const alunos = [];
    
    dados.forEach((linha, index) => {
      try {
        // Extrair dados do aluno
        const matricula = this.extrairMatricula(linha);
        const nome = this.extrairNome(linha);
        const polo = this.extrairPolo(linha);
        
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
            capacidadePorSemestre: this.calcularCapacidadeAluno(disciplinasReprovadas.length)
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
  calcularCapacidadeAluno(totalReprovacoes) {
    // Lógica baseada no número de reprovações e tempo estimado restante
    const tempoRestante = 4; // Assumindo 4 semestres restantes em média
    const capacidadeMaxima = 5; // Máximo de disciplinas por semestre
    
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