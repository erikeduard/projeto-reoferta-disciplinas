// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  Settings, 
  BarChart3, 
  Users, 
  BookOpen, 
  Zap,
  Target,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: Upload,
      title: 'Upload de Dados',
      description: 'Envie planilhas Excel com dados de reprovações dos alunos',
      color: 'bg-blue-500'
    },
    {
      icon: Settings,
      title: 'Configuração Flexível',
      description: 'Ajuste parâmetros do algoritmo genético conforme sua necessidade',
      color: 'bg-green-500'
    },
    {
      icon: BarChart3,
      title: 'Visualizações Avançadas',
      description: 'Gráficos interativos para análise detalhada dos resultados',
      color: 'bg-purple-500'
    },
    {
      icon: Target,
      title: 'Otimização Inteligente',
      description: 'Algoritmo genético otimiza a seleção de disciplinas para reoferta',
      color: 'bg-red-500'
    }
  ];

  const stats = [
    { value: '92%', label: 'Taxa de Sucesso', description: 'Alunos beneficiados' },
    { value: '< 5s', label: 'Tempo de Execução', description: 'Processamento rápido' },
    { value: '10', label: 'Disciplinas Ótimas', description: 'Seleção automática' },
    { value: '50', label: 'Gerações', description: 'Convergência típica' }
  ];

  const steps = [
    {
      step: '1',
      title: 'Upload dos Dados',
      description: 'Faça upload da planilha Excel com os dados de reprovações dos alunos.',
      icon: Upload
    },
    {
      step: '2',
      title: 'Configurar Parâmetros',
      description: 'Ajuste os parâmetros do algoritmo genético conforme necessário.',
      icon: Settings
    },
    {
      step: '3',
      title: 'Executar Otimização',
      description: 'O algoritmo genético encontra a melhor combinação de disciplinas.',
      icon: Zap
    },
    {
      step: '4',
      title: 'Analisar Resultados',
      description: 'Visualize os resultados através de gráficos e relatórios detalhados.',
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Otimização de Reoferta de 
            <span className="text-blue-600"> Disciplinas</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sistema inteligente que utiliza algoritmos genéticos para otimizar a reoferta de disciplinas, 
            maximizando o número de alunos beneficiados com recursos limitados.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/upload"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Upload className="h-5 w-5" />
              <span>Começar Agora</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <Link 
              to="/results"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Ver Exemplo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Resultados Comprovados</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Baseado em testes realizados com dados reais de cursos de Ciência da Computação
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-50 p-6 rounded-lg mb-4">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold text-gray-900">{stat.label}</div>
                  <div className="text-sm text-gray-600">{stat.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Funcionalidades Principais</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para otimizar a reoferta de disciplinas de forma inteligente e eficiente
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200">
                  <div className={`${feature.color} p-3 rounded-lg inline-block mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Processo simples em 4 etapas para otimizar sua reoferta de disciplinas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="bg-blue-100 p-4 rounded-full inline-block">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Algorithm Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Algoritmo Genético Avançado</h2>
              <p className="text-blue-100 mb-6">
                Nosso sistema utiliza algoritmos genéticos inspirados na evolução natural para 
                encontrar a combinação ótima de disciplinas que devem ser reofertadas.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 p-1 rounded">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span>Convergência rápida em ~30 gerações</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 p-1 rounded">
                    <Target className="h-4 w-4" />
                  </div>
                  <span>Otimização multi-objetivo balanceada</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 p-1 rounded">
                    <Users className="h-4 w-4" />
                  </div>
                  <span>Considera capacidade individual dos alunos</span>
                </div>
              </div>
              
              <Link 
                to="/optimization"
                className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 mt-8"
              >
                <Settings className="h-5 w-5" />
                <span>Configurar Algoritmo</span>
              </Link>
            </div>
            
            <div className="bg-white/10 p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Parâmetros Configuráveis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-100">Tamanho da População:</span>
                  <span className="font-semibold">100 indivíduos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Número de Gerações:</span>
                  <span className="font-semibold">50 iterações</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Taxa de Crossover:</span>
                  <span className="font-semibold">80%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Taxa de Mutação:</span>
                  <span className="font-semibold">20%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Estratégia de Elitismo:</span>
                  <span className="font-semibold">10% dos melhores</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para Otimizar suas Reofertas?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Comece agora mesmo fazendo upload dos seus dados e veja como nosso algoritmo 
            pode melhorar significativamente a eficiência das suas reofertas de disciplinas.
          </p>
          
          <Link 
            to="/upload"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 inline-flex items-center space-x-2"
          >
            <Upload className="h-5 w-5" />
            <span>Fazer Upload de Dados</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;