// src/pages/HistoryPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Clock, Users, BookOpen, TrendingUp, Eye, Trash2, 
  Download, Search, Filter, Calendar, BarChart3,
  ChevronRight, RefreshCw, AlertCircle, Database,
  CheckCircle, XCircle, Activity
} from 'lucide-react';
import apiService from '../services/api';

const HistoryPage = () => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedExecutions, setSelectedExecutions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [executionToDelete, setExecutionToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      console.log('Carregando histórico de execuções...');
      const data = await apiService.getAllResults();
      console.log('Resultados recebidos da API:', data);
      console.log('Primeiro item completo:', data[0]);
      
      // A API agora retorna dados completos
      const formattedExecutions = (Array.isArray(data) ? data : []).map(item => {
        console.log('Processando item:', {
          id: item.id,
          aptidao: item.aptidao,
          tempoExecucao: item.tempoExecucao,
          parametros: item.parametros
        });
        
        return {
          id: item.id,
          timestamp: item.timestamp,
          alunosBeneficiados: item.alunosBeneficiados || 0,
          totalAlunos: item.totalAlunos || 0,
          disciplinasReofertadas: item.disciplinasReofertadas || 0,
          aptidao: item.aptidao || 0,
          parametros: item.parametros || {},
          dadosOriginais: {
            totalAlunos: item.totalAlunos || 0,
            totalDisciplinas: item.totalDisciplinas || 0
          },
          status: 'completed',
          tempoExecucao: parseFloat(item.tempoExecucao) || 0
        };
      });
      
      setExecutions(formattedExecutions);
      
      if (formattedExecutions.length === 0) {
        toast('Nenhum resultado encontrado', { icon: '📭' });
      } else {
        toast.success(`${formattedExecutions.length} resultado(s) carregado(s)`);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico');
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'running': return <Activity className="h-4 w-4 animate-pulse" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'running': return 'Executando';
      case 'error': return 'Erro';
      default: return 'Desconhecido';
    }
  };

  const filteredAndSortedExecutions = executions
    .filter(execution => {
      if (filterBy === 'completed') return execution.status === 'completed';
      if (filterBy === 'error') return execution.status === 'error';
      if (searchTerm) {
        return execution.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
               formatDate(execution.timestamp).includes(searchTerm);
      }
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp);
          bValue = new Date(b.timestamp);
          break;
        case 'alunosBeneficiados':
          aValue = a.alunosBeneficiados;
          bValue = b.alunosBeneficiados;
          break;
        case 'aptidao':
          aValue = a.aptidao;
          bValue = b.aptidao;
          break;
        case 'tempoExecucao':
          aValue = a.tempoExecucao || 0;
          bValue = b.tempoExecucao || 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

  const viewResult = (executionId) => {
    navigate(`/results?id=${executionId}`);
  };

  const confirmDelete = (execution) => {
    setExecutionToDelete(execution);
    setShowDeleteModal(true);
  };

  const deleteExecution = async () => {
    if (!executionToDelete) return;
    
    try {
      // Simular exclusão
      setExecutions(prev => prev.filter(e => e.id !== executionToDelete.id));
      toast.success('Execução removida do histórico');
      setShowDeleteModal(false);
      setExecutionToDelete(null);
    } catch (error) {
      toast.error('Erro ao remover execução');
    }
  };

  const toggleSelection = (executionId) => {
    setSelectedExecutions(prev => 
      prev.includes(executionId)
        ? prev.filter(id => id !== executionId)
        : [...prev, executionId]
    );
  };

  const selectAll = () => {
    if (selectedExecutions.length === filteredAndSortedExecutions.length) {
      setSelectedExecutions([]);
    } else {
      setSelectedExecutions(filteredAndSortedExecutions.map(e => e.id));
    }
  };

  const deleteSelected = async () => {
    if (selectedExecutions.length === 0) {
      toast.error('Nenhuma execução selecionada');
      return;
    }
    
    if (window.confirm(`Deseja remover ${selectedExecutions.length} execução(ões)?`)) {
      setExecutions(prev => prev.filter(e => !selectedExecutions.includes(e.id)));
      setSelectedExecutions([]);
      toast.success(`${selectedExecutions.length} execução(ões) removida(s)`);
    }
  };

  const exportResults = () => {
    const dataToExport = selectedExecutions.length > 0
      ? executions.filter(e => selectedExecutions.includes(e.id))
      : filteredAndSortedExecutions;
    
    const jsonData = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico-otimizacao-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Histórico exportado com sucesso');
  };

  const calculateStats = () => {
    const completed = executions.filter(e => e.status === 'completed');
    if (completed.length === 0) return null;
    
    const avgBeneficiados = completed.reduce((sum, e) => sum + e.alunosBeneficiados, 0) / completed.length;
    const avgAptidao = completed.reduce((sum, e) => sum + e.aptidao, 0) / completed.length;
    const avgTempo = completed.reduce((sum, e) => sum + (e.tempoExecucao || 0), 0) / completed.length;
    const successRate = (completed.length / executions.length) * 100;
    
    return {
      avgBeneficiados: avgBeneficiados.toFixed(1),
      avgAptidao: avgAptidao.toFixed(0),
      avgTempo: avgTempo.toFixed(1),
      successRate: successRate.toFixed(1)
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Histórico de Execuções
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Visualize e gerencie o histórico de todas as otimizações executadas no sistema.
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.avgBeneficiados}</span>
              </div>
              <p className="text-sm text-gray-600">Média de Alunos Beneficiados</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.avgAptidao}</span>
              </div>
              <p className="text-sm text-gray-600">Aptidão Média</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.avgTempo}s</span>
              </div>
              <p className="text-sm text-gray-600">Tempo Médio de Execução</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.successRate}%</span>
              </div>
              <p className="text-sm text-gray-600">Taxa de Sucesso</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por ID ou data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter */}
            <div>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Status</option>
                <option value="completed">Concluídos</option>
                <option value="error">Com Erro</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="timestamp">Data</option>
                <option value="alunosBeneficiados">Alunos Beneficiados</option>
                <option value="aptidao">Aptidão</option>
                <option value="tempoExecucao">Tempo de Execução</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            <button
              onClick={loadExecutions}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Atualizar</span>
            </button>

            <button
              onClick={exportResults}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>

            {selectedExecutions.length > 0 && (
              <button
                onClick={deleteSelected}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir Selecionados ({selectedExecutions.length})</span>
              </button>
            )}

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="ml-auto flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>{sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}</span>
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredAndSortedExecutions.length === 0 ? (
            <div className="p-12 text-center">
              <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma execução encontrada
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterBy !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Execute uma otimização para ver o histórico'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedExecutions.length === filteredAndSortedExecutions.length}
                        onChange={selectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alunos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disciplinas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aptidão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tempo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parâmetros
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedExecutions.map((execution) => (
                    <tr key={execution.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedExecutions.includes(execution.id)}
                          onChange={() => toggleSelection(execution.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
                          {getStatusIcon(execution.status)}
                          <span>{getStatusText(execution.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(execution.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {execution.alunosBeneficiados}/{execution.dadosOriginais.totalAlunos}
                        </div>
                        <div className="text-xs text-gray-500">
                          {((execution.alunosBeneficiados / execution.dadosOriginais.totalAlunos) * 100).toFixed(0)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {execution.disciplinasReofertadas}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {execution.aptidao}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {execution.tempoExecucao ? `${execution.tempoExecucao}s` : '-'}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        <div>Pop: {execution.parametros.tamanhoPopulacao}</div>
                        <div>Ger: {execution.parametros.maxGeracoes}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => viewResult(execution.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(execution)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {showDeleteModal && executionToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmar Exclusão
              </h3>
              <p className="text-gray-600 mb-6">
                Deseja realmente excluir esta execução do histórico?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">
                  <strong>ID:</strong> {executionToDelete.id}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Data:</strong> {formatDate(executionToDelete.timestamp)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Alunos:</strong> {executionToDelete.alunosBeneficiados}/{executionToDelete.dadosOriginais.totalAlunos}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteExecution}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;