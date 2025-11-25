// src/services/api.js
import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutos para operações longas
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response || error.message);
    
    // Tratar diferentes tipos de erro
    if (error.response) {
      // Erro com resposta do servidor
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.error || 'Dados inválidos');
        case 404:
          throw new Error(data.error || 'Recurso não encontrado');
        case 413:
          throw new Error('Arquivo muito grande');
        case 500:
          throw new Error(data.error || 'Erro interno do servidor');
        default:
          throw new Error(data.error || `Erro HTTP ${status}`);
      }
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão. Verifique sua internet.');
    } else {
      // Outros erros
      throw new Error(error.message || 'Erro desconhecido');
    }
  }
);

// Serviços da API
const apiService = {
  // Health check
  async healthCheck() {
    try {
      return await api.get('/health');
    } catch (error) {
      throw error;
    }
  },

  // Upload de arquivo
  async uploadFile(formData) {
    try {
      return await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 1 minuto para upload
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // Você pode usar isso para mostrar progresso
          console.log('Upload progress:', percentCompleted + '%');
        }
      });
    } catch (error) {
      throw error;
    }
  },

  // Executar otimização
  async executeOptimization(filename, parametros = {}) {
    try {
      const payload = {
        filename,
        parametros: {
          tamanhoPopulacao: parametros.tamanhoPopulacao || 100,
          maxGeracoes: parametros.maxGeracoes || 50,
          taxaCrossover: parametros.taxaCrossover || 0.8,
          taxaMutacao: parametros.taxaMutacao || 0.2,
          maxDisciplinasReoferta: parametros.maxDisciplinasReoferta || 10,
          pesoAlunosBeneficiados: parametros.pesoAlunosBeneficiados || 100,
          pesoDisciplinasAtendidas: parametros.pesoDisciplinasAtendidas || 1,
          penalizacaoExcesso: parametros.penalizacaoExcesso || 1000,
          verbose: parametros.verbose || false
        }
      };

      return await api.post('/otimizar', payload, {
        timeout: 300000 // 5 minutos para otimização
      });
    } catch (error) {
      throw error;
    }
  },

  // Buscar resultado específico
  async getResult(resultId) {
    try {
      return await api.get(`/resultado/${resultId}`);
    } catch (error) {
      throw error;
    }
  },

  // Listar todos os resultados
  async getAllResults() {
    try {
      return await api.get('/resultados');
    } catch (error) {
      throw error;
    }
  },

  // Baixar relatório (se implementado no backend)
  async downloadReport(resultId, format = 'pdf') {
    try {
      return await api.get(`/resultado/${resultId}/relatorio`, {
        params: { format },
        responseType: 'blob'
      });
    } catch (error) {
      throw error;
    }
  },

  // Validar arquivo antes do upload
  async validateFile(file) {
    // Validações no frontend
    const errors = [];
    
    // Verificar tipo
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('Tipo de arquivo inválido. Use apenas .xlsx ou .xls');
    }
    
    // Verificar tamanho (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('Arquivo muito grande. Máximo 10MB.');
    }
    
    // Verificar se o arquivo não está vazio
    if (file.size === 0) {
      errors.push('Arquivo está vazio.');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Estimar tempo de processamento
  estimateProcessingTime(numAlunos, numDisciplinas, parametros) {
    // Estimativa baseada nos parâmetros
    const baseTime = 2; // segundos base
    const populationFactor = (parametros.tamanhoPopulacao || 100) / 100;
    const generationFactor = (parametros.maxGeracoes || 50) / 50;
    const dataFactor = Math.sqrt((numAlunos * numDisciplinas) / 1000);
    
    const estimatedSeconds = baseTime * populationFactor * generationFactor * dataFactor;
    
    return Math.max(2, Math.ceil(estimatedSeconds)); // Mínimo 2 segundos
  },

  // Utilitário para formatação de dados
  formatResultData(result) {
    if (!result || !result.resultado) return null;
    
    const { melhorAptidao, estatisticas, historico } = result.resultado;
    
    return {
      // Dados principais
      aptidao: melhorAptidao.aptidao,
      alunosBeneficiados: melhorAptidao.alunosBeneficiados,
      totalDisciplinasAtendidas: melhorAptidao.totalDisciplinasAtendidas,
      disciplinasReofertadas: melhorAptidao.disciplinasReofertadas,
      
      // Estatísticas
      eficiencia: estatisticas?.eficiencia || {},
      resumo: estatisticas?.resumo || {},
      
      // Histórico de evolução
      evolucao: historico || [],
      
      // Metadados
      timestamp: result.timestamp,
      parametros: result.parametros || {}
    };
  },

  // Utilitário para validar parâmetros
  validateParameters(params) {
    const errors = [];
    
    if (params.tamanhoPopulacao && (params.tamanhoPopulacao < 10 || params.tamanhoPopulacao > 1000)) {
      errors.push('Tamanho da população deve estar entre 10 e 1000');
    }
    
    if (params.maxGeracoes && (params.maxGeracoes < 5 || params.maxGeracoes > 1000)) {
      errors.push('Número de gerações deve estar entre 5 e 1000');
    }
    
    if (params.taxaCrossover && (params.taxaCrossover < 0.1 || params.taxaCrossover > 1.0)) {
      errors.push('Taxa de crossover deve estar entre 0.1 e 1.0');
    }
    
    if (params.taxaMutacao && (params.taxaMutacao < 0.01 || params.taxaMutacao > 1.0)) {
      errors.push('Taxa de mutação deve estar entre 0.01 e 1.0');
    }
    
    if (params.maxDisciplinasReoferta && (params.maxDisciplinasReoferta < 1 || params.maxDisciplinasReoferta > 50)) {
      errors.push('Máximo de disciplinas deve estar entre 1 e 50');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default apiService;