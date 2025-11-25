// src/pages/OptimizationPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Settings,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Info,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import apiService from '../services/api';

const OptimizationPage = ({ globalState, setGlobalState }) => {
  const [parameters, setParameters] = useState({
    tamanhoPopulacao: 100,
    maxGeracoes: 50,
    taxaCrossover: 0.8,
    taxaMutacao: 0.2,
    maxDisciplinasReoferta: 10,
    pesoAlunosBeneficiados: 100,
    pesoDisciplinasAtendidas: 1,
    penalizacaoExcesso: 1000,
    verbose: false
  });

  const [optimizationState, setOptimizationState] = useState({
    status: 'idle', // idle, running, completed, error
    progress: 0,
    currentGeneration: 0,
    bestFitness: 0,
    estimatedTime: 0,
    elapsedTime: 0,
    result: null,
    error: null
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();

  // Verificar se há arquivo carregado
  useEffect(() => {
    if (!globalState.uploadedFile) {
      toast.error('Nenhum arquivo carregado. Faça upload primeiro.');
      navigate('/upload');
    }
  }, [globalState.uploadedFile, navigate]);

  // Validar parâmetros quando mudarem
  useEffect(() => {
    const validation = apiService.validateParameters(parameters);
    setValidationErrors(validation.errors);
  }, [parameters]);

  // Estimar tempo de processamento
  useEffect(() => {
    if (globalState.uploadedFile?.dados) {
      const { totalAlunos, totalDisciplinas } = globalState.uploadedFile.dados;
      const estimatedTime = apiService.estimateProcessingTime(
        totalAlunos,
        totalDisciplinas,
        parameters
      );
      setOptimizationState(prev => ({ ...prev, estimatedTime }));
    }
  }, [parameters, globalState.uploadedFile]);

  // Atualizar parâmetro
  const updateParameter = (key, value) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  // Executar otimização
  const runOptimization = async () => {
    if (!globalState.uploadedFile) {
      toast.error('Nenhum arquivo carregado');
      return;
    }

    if (validationErrors.length > 0) {
      toast.error('Corrija os parâmetros inválidos antes de continuar');
      return;
    }

    setOptimizationState(prev => ({
      ...prev,
      status: 'running',
      progress: 0,
      currentGeneration: 0,
      bestFitness: 0,
      elapsedTime: 0,
      error: null
    }));

    // Simular progresso
    const progressInterval = setInterval(() => {
      setOptimizationState(prev => {
        if (prev.status !== 'running') {
          clearInterval(progressInterval);
          return prev;
        }

        const newProgress = Math.min(prev.progress + Math.random() * 10, 95);
        const newGeneration = Math.floor((newProgress / 100) * parameters.maxGeracoes);
        
        return {
          ...prev,
          progress: newProgress,
          currentGeneration: newGeneration,
          elapsedTime: prev.elapsedTime + 1
        };
      });
    }, 1000);

    try {
      const result = await apiService.executeOptimization(
        globalState.uploadedFile.filename,
        parameters
      );

      clearInterval(progressInterval);

      setOptimizationState(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        currentGeneration: parameters.maxGeracoes,
        result
      }));

      console.log('OptimizationPage - resultado da API:', result);
      console.log('OptimizationPage - histórico no resultado:', result?.resultado?.historico);

      // Salvar resultado no estado global
      setGlobalState(prev => ({
        ...prev,
        optimizationResult: result
      }));

      toast.success('Otimização concluída com sucesso!');

    } catch (error) {
      clearInterval(progressInterval);
      
      setOptimizationState(prev => ({
        ...prev,
        status: 'error',
        error: error.message
      }));

      toast.error(`Erro na otimização: ${error.message}`);
    }
  };

  // Resetar otimização
  const resetOptimization = () => {
    setOptimizationState({
      status: 'idle',
      progress: 0,
      currentGeneration: 0,
      bestFitness: 0,
      estimatedTime: 0,
      elapsedTime: 0,
      result: null,
      error: null
    });
  };

  // Ir para resultados
  const viewResults = () => {
    navigate('/results');
  };

  // Preset de parâmetros
  const applyPreset = (presetName) => {
    const presets = {
      fast: {
        tamanhoPopulacao: 50,
        maxGeracoes: 25,
        taxaCrossover: 0.8,
        taxaMutacao: 0.2,
        maxDisciplinasReoferta: 10
      },
      balanced: {
        tamanhoPopulacao: 100,
        maxGeracoes: 50,
        taxaCrossover: 0.8,
        taxaMutacao: 0.2,
        maxDisciplinasReoferta: 10
      },
      thorough: {
        tamanhoPopulacao: 200,
        maxGeracoes: 100,
        taxaCrossover: 0.9,
        taxaMutacao: 0.1,
        maxDisciplinasReoferta: 15
      }
    };

    if (presets[presetName]) {
      setParameters(prev => ({ ...prev, ...presets[presetName] }));
      toast.success(`Preset "${presetName}" aplicado`);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Configuração do Algoritmo Genético
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Configure os parâmetros do algoritmo genético e execute a otimização para 
            encontrar o conjunto ideal de disciplinas para reoferta.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configurações */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Info */}
            {globalState.uploadedFile && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Arquivo Carregado
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-blue-600">
                      {globalState.uploadedFile.dados.totalAlunos}
                    </div>
                    <div className="text-sm text-gray-600">Alunos</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-green-600">
                      {globalState.uploadedFile.dados.totalDisciplinas}
                    </div>
                    <div className="text-sm text-gray-600">Disciplinas</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-red-600">
                      {globalState.uploadedFile.dados.alunosComReprovacoes}
                    </div>
                    <div className="text-sm text-gray-600">Com Reprovações</div>
                  </div>
                </div>
              </div>
            )}

            {/* Presets */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Configurações Predefinidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => applyPreset('fast')}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors text-left"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Rápido</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Processamento rápido</p>
                  <div className="text-xs text-gray-500">
                    50 indivíduos, 25 gerações
                  </div>
                </button>

                <button
                  onClick={() => applyPreset('balanced')}
                  className="p-4 border-2 border-blue-300 bg-blue-50 rounded-lg hover:border-blue-400 transition-colors text-left"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Balanceado</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Recomendado</p>
                  <div className="text-xs text-gray-500">
                    100 indivíduos, 50 gerações
                  </div>
                </button>

                <button
                  onClick={() => applyPreset('thorough')}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors text-left"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold">Detalhado</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Maior precisão</p>
                  <div className="text-xs text-gray-500">
                    200 indivíduos, 100 gerações
                  </div>
                </button>
              </div>
            </div>

            {/* Basic Parameters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Parâmetros Básicos
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tamanho da População */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamanho da População
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={parameters.tamanhoPopulacao}
                    onChange={(e) => updateParameter('tamanhoPopulacao', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Número de soluções candidatas por geração (10-1000)
                  </p>
                </div>

                {/* Máximo de Gerações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Gerações
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    value={parameters.maxGeracoes}
                    onChange={(e) => updateParameter('maxGeracoes', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Número máximo de iterações (5-1000)
                  </p>
                </div>

                {/* Taxa de Crossover */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa de Crossover: {(parameters.taxaCrossover * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={parameters.taxaCrossover}
                    onChange={(e) => updateParameter('taxaCrossover', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Probabilidade de recombinação genética (10%-100%)
                  </p>
                </div>

                {/* Taxa de Mutação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa de Mutação: {(parameters.taxaMutacao * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="1.0"
                    step="0.01"
                    value={parameters.taxaMutacao}
                    onChange={(e) => updateParameter('taxaMutacao', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Probabilidade de alteração aleatória (1%-100%)
                  </p>
                </div>

                {/* Máximo de Disciplinas */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Disciplinas para Reoferta
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={parameters.maxDisciplinasReoferta}
                    onChange={(e) => updateParameter('maxDisciplinasReoferta', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Limite de disciplinas que podem ser selecionadas (1-50)
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced Parameters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Parâmetros Avançados
                </h2>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                >
                  {showAdvanced ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              
              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Peso Alunos Beneficiados */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso - Alunos Beneficiados
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={parameters.pesoAlunosBeneficiados}
                      onChange={(e) => updateParameter('pesoAlunosBeneficiados', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Importância do número de alunos beneficiados
                    </p>
                  </div>

                  {/* Peso Disciplinas Atendidas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso - Disciplinas Atendidas
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={parameters.pesoDisciplinasAtendidas}
                      onChange={(e) => updateParameter('pesoDisciplinasAtendidas', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Importância do total de disciplinas atendidas
                    </p>
                  </div>

                  {/* Penalização de Excesso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Penalização por Excesso
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="10000"
                      value={parameters.penalizacaoExcesso}
                      onChange={(e) => updateParameter('penalizacaoExcesso', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Penalização por exceder limite de disciplinas
                    </p>
                  </div>

                  {/* Verbose */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="verbose"
                      checked={parameters.verbose}
                      onChange={(e) => updateParameter('verbose', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="verbose" className="text-sm font-medium text-gray-700">
                      Log Detalhado
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Parâmetros Inválidos
                    </h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Execution Panel */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Execução
              </h3>
              
              {/* Status */}
              <div className="mb-4">
                {optimizationState.status === 'idle' && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Aguardando execução</span>
                  </div>
                )}
                
                {optimizationState.status === 'running' && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Executando otimização...</span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progresso</span>
                        <span>{optimizationState.progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${optimizationState.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">Geração:</span>
                        <div className="font-semibold">
                          {optimizationState.currentGeneration}/{parameters.maxGeracoes}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Tempo:</span>
                        <div className="font-semibold">
                          {formatTime(optimizationState.elapsedTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {optimizationState.status === 'completed' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Concluído com sucesso</span>
                  </div>
                )}
                
                {optimizationState.status === 'error' && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Erro na execução</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {optimizationState.status === 'idle' && (
                  <button
                    onClick={runOptimization}
                    disabled={validationErrors.length > 0 || !globalState.uploadedFile}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Executar Otimização</span>
                  </button>
                )}
                
                {optimizationState.status === 'running' && (
                  <button
                    onClick={resetOptimization}
                    className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Pause className="h-4 w-4" />
                    <span>Parar Execução</span>
                  </button>
                )}
                
                {optimizationState.status === 'completed' && (
                  <div className="space-y-2">
                    <button
                      onClick={viewResults}
                      className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>Ver Resultados</span>
                    </button>
                    <button
                      onClick={resetOptimization}
                      className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Nova Otimização</span>
                    </button>
                  </div>
                )}
                
                {optimizationState.status === 'error' && (
                  <div className="space-y-2">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        {optimizationState.error}
                      </p>
                    </div>
                    <button
                      onClick={resetOptimization}
                      className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Tentar Novamente</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Estimation Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Estimativas
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-800">Tempo estimado:</span>
                  <span className="font-semibold text-blue-900">
                    ~{formatTime(optimizationState.estimatedTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Indivíduos/geração:</span>
                  <span className="font-semibold text-blue-900">
                    {parameters.tamanhoPopulacao}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Total de avaliações:</span>
                  <span className="font-semibold text-blue-900">
                    {(parameters.tamanhoPopulacao * parameters.maxGeracoes).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Dicas</span>
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>Tamanho da População:</strong> Populações maiores exploram melhor 
                  o espaço de soluções, mas levam mais tempo.
                </p>
                <p>
                  <strong>Taxa de Crossover:</strong> Valores altos (70-90%) promovem 
                  mais exploração de novas soluções.
                </p>
                <p>
                  <strong>Taxa de Mutação:</strong> Valores baixos (1-20%) mantêm 
                  diversidade sem destruir boas soluções.
                </p>
                <p>
                  <strong>Gerações:</strong> Mais gerações permitem melhor convergência, 
                  mas com rendimentos decrescentes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationPage;