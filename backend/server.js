const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const XLSX = require('xlsx');
const winston = require('winston');

// Configuração do logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const app = express();
const PORT = process.env.PORT || 3001;

// Quando está atrás de um proxy (Nginx), habilitar trust proxy para IP correto no rate-limit
app.set('trust proxy', 1);

// Middlewares de segurança e performance
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP a cada 15 minutos
});
app.use(limiter);

// Logging
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));

// Parser de JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel (.xlsx, .xls) são permitidos'), false);
    }
  }
});

// Importar o algoritmo genético
const AlgoritmoGenetico = require('./src/algoritmoGenetico');
const AbordagensComparativas = require('./src/abordagensComparativas');
const DataProcessor = require('./src/dataProcessor');

// Rotas da API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.post('/api/upload', upload.single('planilha'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    logger.info(`Arquivo recebido: ${req.file.filename}`);

    // Processar o arquivo Excel
    const dataProcessor = new DataProcessor();
    const dadosProcessados = await dataProcessor.processarPlanilha(req.file.path);

    res.json({
      message: 'Arquivo processado com sucesso',
      filename: req.file.filename,
      dados: {
        totalAlunos: dadosProcessados.alunos.length,
        totalDisciplinas: dadosProcessados.disciplinas.length,
        alunosComReprovacoes: dadosProcessados.alunos.filter(a => a.totalReprovacoes > 0).length
      }
    });

  } catch (error) {
    logger.error('Erro ao processar arquivo:', error);
    // Se for erro de validação/planilha inválida, retornar 400
    const msg = error?.message || '';
    if (msg.includes('Erro ao processar planilha') || msg.includes('Planilha vazia') || msg.includes('Nenhuma disciplina') || msg.includes('Nenhum aluno')) {
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: msg
    });
  }
});

app.post('/api/otimizar', async (req, res) => {
  try {
    const { filename, parametros } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Nome do arquivo é obrigatório' });
    }

    const filePath = path.join(__dirname, 'uploads', filename);

    // Verificar se o arquivo existe
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    logger.info(`Iniciando otimização para arquivo: ${filename}`);

    // Processar dados
    const dataProcessor = new DataProcessor();
    const dadosProcessados = await dataProcessor.processarPlanilha(filePath);

    // Executar algoritmo genético
    const ag = new AlgoritmoGenetico(parametros);
    const resultado = await ag.executar(dadosProcessados);

    // Salvar resultado
    const resultadoId = `resultado-${Date.now()}`;
    const resultadoPath = path.join(__dirname, 'results', `${resultadoId}.json`);

    // Criar disciplinasInfo com todas as disciplinas (selecionadas e não selecionadas)
    const disciplinasInfo = dadosProcessados.disciplinas.map(d => ({
      codigo: d.codigo,
      nome: d.nome,
      alunosReprovados: d.alunosReprovados,
      selecionada: resultado.melhorAptidao.disciplinasReofertadas.includes(d.codigo)
    }));

    await fs.writeFile(resultadoPath, JSON.stringify({
      id: resultadoId,
      timestamp: new Date().toISOString(),
      parametros,
      resultado: {
        ...resultado,
        disciplinasInfo
      },
      dadosOriginais: {
        totalAlunos: dadosProcessados.alunos.length,
        totalDisciplinas: dadosProcessados.disciplinas.length
      }
    }, null, 2));

    logger.info(`Otimização concluída. Resultado salvo: ${resultadoId}`);

    res.json({
      message: 'Otimização concluída com sucesso',
      resultadoId,
      resultado: {
        melhorAptidao: resultado.melhorAptidao,
        disciplinasReofertadas: resultado.disciplinasReofertadas,
        disciplinasInfo,
        estatisticas: resultado.estatisticas,
        historico: resultado.historico
      }
    });

  } catch (error) {
    logger.error('Erro durante otimização:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

app.post('/api/comparar', async (req, res) => {
  try {
    const { filename, parametros } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Nome do arquivo é obrigatório' });
    }

    const filePath = path.join(__dirname, 'uploads', filename);

    // Verificar se o arquivo existe
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    logger.info(`Iniciando comparação para arquivo: ${filename}`);

    // Processar dados
    const dataProcessor = new DataProcessor();
    const dadosProcessados = await dataProcessor.processarPlanilha(filePath);

    // Executar AG primeiro (necessário para a comparação)
    const ag = new AlgoritmoGenetico(parametros);
    const resultadoAG = await ag.executar(dadosProcessados);

    // Executar comparação
    const comparador = new AbordagensComparativas(parametros);
    const comparacao = comparador.compararAbordagens(dadosProcessados, resultadoAG);

    res.json({
      message: 'Comparação concluída com sucesso',
      comparacao,
      // Retornar também o ID do resultado do AG para referência
      resultadoAG: {
        melhorAptidao: resultadoAG.melhorAptidao,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Erro durante comparação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

app.get('/api/resultado/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultadoPath = path.join(__dirname, 'results', `${id}.json`);

    try {
      const resultado = await fs.readFile(resultadoPath, 'utf8');
      res.json(JSON.parse(resultado));
    } catch {
      res.status(404).json({ error: 'Resultado não encontrado' });
    }

  } catch (error) {
    logger.error('Erro ao buscar resultado:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

app.get('/api/resultados', async (req, res) => {
  try {
    const resultsDir = path.join(__dirname, 'results');
    const files = await fs.readdir(resultsDir);

    const resultados = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          try {
            const content = await fs.readFile(path.join(resultsDir, file), 'utf8');
            const data = JSON.parse(content);

            // Extrair informações completas
            const melhorAptidao = data.resultado?.melhorAptidao || {};
            const dadosOriginais = data.dadosOriginais || {};
            const parametros = data.parametros || {};
            const historico = data.resultado?.historico || [];

            // Para arquivos antigos sem dadosOriginais, tentar inferir dos detalhes
            let totalAlunos = dadosOriginais.totalAlunos || 0;
            let totalDisciplinas = dadosOriginais.totalDisciplinas || 0;

            if (!totalAlunos && melhorAptidao.detalhesPorAluno?.length) {
              totalAlunos = melhorAptidao.detalhesPorAluno.length;
            }

            if (!totalDisciplinas && melhorAptidao.disciplinasReofertadas?.length) {
              // Estimativa baseada nas disciplinas reofertadas
              totalDisciplinas = melhorAptidao.totalDisciplinasAtendidas ||
                melhorAptidao.disciplinasReofertadas.length;
            }

            const resultado = {
              id: data.id,
              timestamp: data.timestamp,
              alunosBeneficiados: melhorAptidao.alunosBeneficiados || 0,
              disciplinasReofertadas: melhorAptidao.numDisciplinasReofertadas || 0,
              aptidao: melhorAptidao.aptidao || 0,
              totalAlunos,
              totalDisciplinas,
              parametros: {
                tamanhoPopulacao: parametros.tamanhoPopulacao || 0,
                maxGeracoes: parametros.maxGeracoes || 0,
                maxDisciplinasReoferta: parametros.maxDisciplinasReoferta || 0
              },
              // Calcular tempo aproximado (em segundos) baseado no histórico
              tempoExecucao: historico.length ?
                (historico.length * 0.1).toFixed(1) : '0.0'
            };

            logger.info(`Resultado ${file}: aptidao=${resultado.aptidao}, tempo=${resultado.tempoExecucao}s`);

            return resultado;
          } catch (error) {
            logger.error(`Erro ao processar arquivo ${file}:`, error);
            return null;
          }
        })
    );

    // Filtrar nulos e ordenar por timestamp (mais recente primeiro)
    const resultadosFiltrados = resultados
      .filter(r => r !== null)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(resultadosFiltrados);

  } catch (error) {
    logger.error('Erro ao listar resultados:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  logger.error('Erro não tratado:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 10MB.' });
    }
  }

  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});

module.exports = app;