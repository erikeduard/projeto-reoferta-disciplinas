// src/pages/ResultsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, BookOpen, Award, Download, Share2,
  ChevronDown, ChevronUp, Info, CheckCircle, Target,
  BarChart3, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';

const ResultsPage = ({ globalState, setGlobalState }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    disciplines: true,
    students: false,
    evolution: false,
    analysis: false
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loadResult = async () => {
      // Verificar se há ID na URL (vindo do histórico)
      const resultId = searchParams.get('id');

      if (resultId) {
        setLoading(true);
        try {
          console.log('Carregando resultado do histórico:', resultId);
          const response = await apiService.getResult(resultId);
          console.log('Resultado carregado:', response);
          console.log('Histórico no resultado:', response?.resultado?.historico);
          setSelectedResult(response);
        } catch (error) {
          console.error('Erro ao carregar resultado:', error);
          toast.error('Erro ao carregar resultado');
        } finally {
          setLoading(false);
        }
      } else {
        // Usar dados reais do estado global se disponível
        const resultData = globalState.optimizationResult;
        console.log('ResultsPage - dados do estado global:', resultData);
        console.log('ResultsPage - histórico:', resultData?.resultado?.historico || resultData?.historico);
        setSelectedResult(resultData);
      }
    };

    loadResult();
  }, [globalState.optimizationResult, searchParams]);

  // Se não há dados, mostrar mensagem
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Carregando resultado...
          </h2>
        </div>
      </div>
    );
  }

  if (!selectedResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Nenhum resultado disponível
          </h2>
          <p className="text-gray-600 mb-6">
            Execute uma otimização primeiro para ver os resultados.
          </p>
          <button
            onClick={() => navigate('/optimization')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Ir para Otimização
          </button>
        </div>
      </div>
    );
  }

  // Normalizar estrutura (backend pode retornar {resultado: {...}})
  const r = selectedResult?.resultado ? selectedResult.resultado : (selectedResult || {});
  const best = r?.melhorAptidao || {};
  const stats = r?.estatisticas || {};
  const totalAlunos = stats?.resumo?.totalAlunos ?? 50;

  console.log('=== DEBUG COMPLETO ===');
  console.log('selectedResult completo:', JSON.stringify(selectedResult, null, 2));
  console.log('r (normalizado):', r);
  console.log('r.historico:', r?.historico);
  console.log('selectedResult.historico:', selectedResult?.historico);
  console.log('selectedResult.resultado:', selectedResult?.resultado);

  // Disciplinas: usar lista fornecida ou derivar das reofertadas
  const disciplinasInfo = r?.disciplinasInfo
    || (Array.isArray(r?.disciplinasReofertadas)
      ? r.disciplinasReofertadas.map(d => ({
        codigo: d?.codigo || d,
        nome: d?.nome || String(d?.codigo || d),
        alunosReprovados: d?.alunosReprovados ?? 0,
        selecionada: true
      }))
      : []);

  // Preparar dados para gráficos
  // Filtrar apenas: disciplinas selecionadas + top 6 não selecionadas (mesmas da lista)
  const disciplinasSelecionadas = disciplinasInfo.filter(d => d.selecionada);
  const disciplinasNaoSelecionadas = disciplinasInfo.filter(d => !d.selecionada).slice(0, 6);
  const disciplinasParaGrafico = [...disciplinasSelecionadas, ...disciplinasNaoSelecionadas];

  // Ordenar por quantidade de alunos reprovados (decrescente)
  const disciplinasData = disciplinasParaGrafico
    .sort((a, b) => b.alunosReprovados - a.alunosReprovados)
    .map(d => ({
      codigo: d.codigo.replace('CCCD', ''),
      nome: d.nome.length > 30 ? d.nome.substring(0, 30) + '...' : d.nome,
      alunosReprovados: d.alunosReprovados,
      selecionada: d.selecionada
    })) || [];

  const alunosBeneficiadosData = [
    {
      categoria: 'Beneficiados',
      valor: best?.alunosBeneficiados ?? 0,
      cor: '#0088FE'
    },
    {
      categoria: 'Não Beneficiados',
      valor: Math.max(0, totalAlunos - (best?.alunosBeneficiados ?? 0)),
      cor: '#FF8042'
    }
  ];

  const perfilAlunosData = stats?.perfisPorReprovacao ?
    Object.entries(stats.perfisPorReprovacao).map(([faixa, data]) => ({
      faixa,
      total: data.total,
      beneficiados: data.beneficiados,
      percentual: ((data.beneficiados / data.total) * 100).toFixed(1)
    })) : [];

  const capacidadeData = stats?.distribuicaoCapacidade ?
    Object.entries(stats.distribuicaoCapacidade)
      .map(([cap, qtd]) => ({
        capacidade: cap,
        quantidade: qtd
      }))
      .sort((a, b) => Number(a.capacidade) - Number(b.capacidade))
    : [];

  const semestresData = stats?.disciplinasPorSemestre ?
    Object.entries(stats.disciplinasPorSemestre)
      .map(([sem, qtd]) => ({
        semestre: `${sem}º Sem`,
        quantidade: qtd
      }))
      .sort((a, b) => parseInt(a.semestre) - parseInt(b.semestre))
    : [];

  // Extrair histórico de diferentes estruturas possíveis
  const evolucaoData = r?.historico || selectedResult?.historico || [];

  console.log('DEBUG capacidadeData:', capacidadeData);
  console.log('DEBUG stats.distribuicaoCapacidade:', stats?.distribuicaoCapacidade);

  console.log('Dados de evolução:', evolucaoData);
  console.log('Tamanho do array:', evolucaoData.length);

  // Calcular métricas da evolução dinamicamente
  const calcularMetricasEvolucao = () => {
    if (!evolucaoData || evolucaoData.length === 0) {
      return {
        geracaoConvergencia: 0,
        melhoriaTotal: 0,
        aptidaoInicial: 0,
        aptidaoFinal: 0,
        estabilidade: 'Sem dados',
        textoAnalise: 'Dados de evolução não disponíveis.'
      };
    }

    const aptidaoInicial = evolucaoData[0]?.melhorAptidao || 0;
    const aptidaoFinal = evolucaoData[evolucaoData.length - 1]?.melhorAptidao || 0;
    const melhoriaTotal = aptidaoFinal - aptidaoInicial;

    // Encontrar geração de convergência (quando a aptidão para de melhorar significativamente)
    let geracaoConvergencia = 1;
    const limiarMelhoria = aptidaoFinal * 0.02; // 2% do valor final

    for (let i = 1; i < evolucaoData.length; i++) {
      const melhoriaRestante = aptidaoFinal - evolucaoData[i].melhorAptidao;
      if (melhoriaRestante <= limiarMelhoria) {
        geracaoConvergencia = i + 1;
        break;
      }
    }

    // Calcular estabilidade (quantas gerações finais mantiveram o mesmo valor)
    let geracoesEstaveis = 0;
    for (let i = evolucaoData.length - 1; i >= 0; i--) {
      if (evolucaoData[i].melhorAptidao === aptidaoFinal) {
        geracoesEstaveis++;
      } else {
        break;
      }
    }

    const estabilidade = geracoesEstaveis >= 10 ? 'Estável' : geracoesEstaveis >= 5 ? 'Moderada' : 'Instável';

    // Gerar texto de análise dinâmico
    const percentualGeracao = ((geracaoConvergencia / evolucaoData.length) * 100).toFixed(0);
    const textoAnalise = melhoriaTotal > 0
      ? `O algoritmo convergiu na geração ${geracaoConvergencia} (${percentualGeracao}% do total) e manteve estabilidade por ${geracoesEstaveis} gerações. Melhoria de ${melhoriaTotal} pontos indica uma boa otimização.`
      : `O algoritmo encontrou a melhor solução logo na primeira geração e a manteve por ${geracoesEstaveis} gerações, indicando que a solução inicial já era ótima.`;

    return {
      geracaoConvergencia,
      melhoriaTotal,
      aptidaoInicial,
      aptidaoFinal,
      estabilidade,
      geracoesEstaveis,
      textoAnalise
    };
  };

  const metricasEvolucao = calcularMetricasEvolucao();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const downloadReport = async () => {
    try {
      toast.success('Funcionalidade de download será implementada em breve!');
    } catch (error) {
      toast.error('Erro ao gerar relatório');
    }
  };

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Resultados da Otimização de Reoferta',
          text: `${selectedResult.melhorAptidao.alunosBeneficiados} alunos beneficiados com ${selectedResult.melhorAptidao.numDisciplinasReofertadas} disciplinas reofertadas`,
          url: window.location.href
        });
      } catch (error) {
        // Fallback para cópia do link
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado para a área de transferência!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Resultados da Otimização
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Análise detalhada dos resultados do algoritmo genético para otimização
            da reoferta de disciplinas.
          </p>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={downloadReport}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Baixar Relatório</span>
            </button>
            <button
              onClick={shareResults}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Compartilhar</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-blue-100 p-3 rounded-full inline-block mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {(best?.alunosBeneficiados ?? 0)}/{totalAlunos}
            </div>
            <div className="text-sm text-gray-600">Alunos Beneficiados</div>
            <div className="text-lg font-semibold text-green-600 mt-1">
              {stats?.eficiencia?.percentualAlunosBeneficiados}%
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-green-100 p-3 rounded-full inline-block mb-4">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {best?.numDisciplinasReofertadas ?? 0}
            </div>
            <div className="text-sm text-gray-600">Disciplinas Selecionadas</div>
            <div className="text-lg font-semibold text-blue-600 mt-1">
              {(best?.totalDisciplinasAtendidas ?? 0)} atendidas
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-purple-100 p-3 rounded-full inline-block mb-4">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {best?.aptidao ?? 0}
            </div>
            <div className="text-sm text-gray-600">Aptidão Final</div>
            <div className="text-lg font-semibold text-purple-600 mt-1">
              Ótimo
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="bg-yellow-100 p-3 rounded-full inline-block mb-4">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {stats?.eficiencia?.mediaAlunosPorDisciplina}
            </div>
            <div className="text-sm text-gray-600">Alunos por Disciplina</div>
            <div className="text-lg font-semibold text-yellow-600 mt-1">
              Eficiente
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                { id: 'disciplines', label: 'Disciplinas', icon: BookOpen },
                { id: 'students', label: 'Alunos', icon: Users },
                { id: 'evolution', label: 'Evolução', icon: TrendingUp }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Disciplinas Selecionadas */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Disciplinas Selecionadas para Reoferta</span>
                    </h2>
                    <button
                      onClick={() => toggleSection('disciplines')}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {expandedSections.disciplines ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  </div>

                  {expandedSections.disciplines && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(best?.disciplinasReofertadas || []).map((codigo, index) => {
                        const disciplina = disciplinasInfo?.find(d => d.codigo === codigo);
                        return (
                          <div key={codigo} className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-green-900">{codigo}</h3>
                                <p className="text-sm text-green-700 mt-1">
                                  {disciplina?.nome || 'Nome não disponível'}
                                </p>
                                {disciplina && (
                                  <p className="text-xs text-green-600 mt-2">
                                    {disciplina.alunosReprovados} alunos reprovados
                                  </p>
                                )}
                              </div>
                              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                                #{index + 1}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Gráfico de Disciplinas por Semestre */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Distribuição por Semestre da Grade
                  </h2>
                  <div className="bg-white p-6 rounded-lg">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={semestresData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semestre" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="quantidade" name="Disciplinas Reofertadas" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Pizza - Alunos Beneficiados */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Distribuição de Alunos Beneficiados
                  </h2>
                  <div className="bg-white p-6 rounded-lg">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={alunosBeneficiadosData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="valor"
                          label={({ categoria, percent }) => `${categoria}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {alunosBeneficiadosData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Alunos']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Estatísticas de Eficiência */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Métricas de Eficiência
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-800 mb-2">Taxa de Cobertura</h3>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedResult.estatisticas?.eficiencia?.percentualAlunosBeneficiados}%
                      </div>
                      <p className="text-sm text-blue-700 mt-1">dos alunos com reprovações</p>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="text-sm font-medium text-green-800 mb-2">Disciplinas por Aluno</h3>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedResult.estatisticas?.eficiencia?.mediaDisciplinasPorAluno}
                      </div>
                      <p className="text-sm text-green-700 mt-1">média de disciplinas atendidas</p>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h3 className="text-sm font-medium text-purple-800 mb-2">Alunos por Disciplina</h3>
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedResult.estatisticas?.eficiencia?.mediaAlunosPorDisciplina}
                      </div>
                      <p className="text-sm text-purple-700 mt-1">eficiência da seleção</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Disciplines Tab */}
            {activeTab === 'disciplines' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Análise Detalhada das Disciplinas
                </h2>

                <div className="bg-white p-6 rounded-lg mb-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={disciplinasData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="codigo"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={10}
                      />
                      <YAxis label={{ value: 'Alunos Reprovados', angle: -90, position: 'insideLeft' }} />
                      <Tooltip
                        formatter={(value, name, props) => [
                          value,
                          `Alunos Reprovados - ${props.payload.nome}`
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="alunosReprovados"
                        name="Alunos Reprovados"
                        fill={(entry) => entry?.selecionada ? "#0088FE" : "#FF8042"}
                      >
                        {disciplinasData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.selecionada ? "#0088FE" : "#FF8042"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                      Disciplinas Selecionadas
                    </h3>
                    <div className="space-y-2">
                      {disciplinasInfo?.filter(d => d.selecionada).map((disciplina) => (
                        <div key={disciplina.codigo} className="flex justify-between items-center bg-white p-3 rounded">
                          <span className="font-medium">{disciplina.codigo}</span>
                          <span className="text-blue-600"> {disciplina.alunosReprovados} alunos</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Disciplinas Não Selecionadas
                    </h3>
                    <div className="space-y-2">
                      {disciplinasInfo?.filter(d => !d.selecionada).slice(0, 6).map((disciplina) => (
                        <div key={disciplina.codigo} className="flex justify-between items-center bg-white p-3 rounded">
                          <span className="font-medium text-gray-600">{disciplina.codigo}</span>
                          <span className="text-gray-500">{disciplina.alunosReprovados} alunos</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Análise do Impacto nos Alunos
                </h2>

                <div className="bg-white p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Distribuição de Capacidade dos Alunos
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Capacidade de disciplinas por semestre (adaptativa baseada no ano de ingresso)
                  </p>

                  {capacidadeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={capacidadeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="capacidade" label={{ value: 'Capacidade', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: 'Qtd Alunos', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => [value, 'Alunos']} />
                        <Legend />
                        <Bar dataKey="quantidade" name="Quantidade de Alunos" fill="#F59E0B" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded border border-gray-200 border-dashed">
                      <BarChart3 className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-gray-500 font-medium">Gráfico indisponível para este resultado</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Execute uma nova otimização para gerar os dados de capacidade atualizados.
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Beneficiados por Perfil de Reprovação
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={perfilAlunosData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="faixa" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Total de Alunos" fill="#E5E7EB" />
                      <Bar dataKey="beneficiados" name="Beneficiados" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">
                      Taxa de Sucesso por Perfil
                    </h3>
                    <div className="space-y-3">
                      {perfilAlunosData.map((perfil) => (
                        <div key={perfil.faixa}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-green-800">{perfil.faixa}</span>
                            <span className="text-sm text-green-600">{perfil.percentual}%</span>
                          </div>
                          <div className="w-full bg-green-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${perfil.percentual}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                      Resumo de Impacto
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-blue-800">Total de alunos:</span>
                        <span className="font-semibold">{totalAlunos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-800">Beneficiados:</span>
                        <span className="font-semibold text-green-600">
                          {best?.alunosBeneficiados ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-800">Taxa de cobertura:</span>
                        <span className="font-semibold text-green-600">
                          {stats?.eficiencia?.percentualAlunosBeneficiados}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-800">Disciplinas atendidas:</span>
                        <span className="font-semibold">
                          {best?.totalDisciplinasAtendidas ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Evolution Tab */}
            {activeTab === 'evolution' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Evolução do Algoritmo Genético
                </h2>

                <div className="bg-white p-6 rounded-lg mb-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={evolucaoData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="geracao"
                        label={{ value: 'Geração', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis
                        label={{ value: 'Aptidão', angle: -90, position: 'insideLeft' }}
                        domain={['dataMin - 50', 'dataMax + 50']}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="melhorAptidao"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        name="Melhor (Best)"
                      />
                      <Line
                        type="monotone"
                        dataKey="mediaAptidao"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                        name="Média (Avg)"
                      />
                      <Line
                        type="monotone"
                        dataKey="piorAptidao"
                        stroke="#EF4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                        name="Pior (Worst)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Convergência</h3>
                    <div className="text-2xl font-bold text-blue-600">
                      Geração {metricasEvolucao.geracaoConvergencia}
                    </div>
                    <p className="text-sm text-blue-700 mt-1">Primeira convergência</p>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800 mb-2">Melhoria Total</h3>
                    <div className="text-2xl font-bold text-green-600">
                      {metricasEvolucao.melhoriaTotal > 0 ? '+' : ''}{metricasEvolucao.melhoriaTotal} pontos
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      {metricasEvolucao.aptidaoInicial} → {metricasEvolucao.aptidaoFinal}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-800 mb-2">Estabilidade</h3>
                    <div className="text-2xl font-bold text-purple-600">
                      {metricasEvolucao.estabilidade}
                    </div>
                    <p className="text-sm text-purple-700 mt-1">
                      Últimas {metricasEvolucao.geracoesEstaveis} gerações
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Análise da Convergência</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        {metricasEvolucao.textoAnalise}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default ResultsPage;