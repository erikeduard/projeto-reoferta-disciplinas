// Nova HomePage com design moderno
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Settings, BarChart3, Target, Zap, Users, Clock, TrendingUp,
  CheckCircle, ArrowRight, Sparkles, Brain, Award
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Upload,
      title: 'Upload de Dados',
      description: 'Envie planilhas Excel com dados de reprovações dos alunos de forma rápida e segura',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Settings,
      title: 'Configuração Flexível',
      description: 'Ajuste parâmetros do algoritmo genético conforme suas necessidades específicas',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'Visualizações Avançadas',
      description: 'Gráficos interativos e relatórios detalhados para análise completa dos resultados',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Otimização Inteligente',
      description: 'Algoritmo genético otimiza automaticamente a seleção de disciplinas para reoferta',
      gradient: 'from-red-500 to-orange-500'
    }
  ];

  const stats = [
    { value: '92%', label: 'Taxa de Sucesso', description: 'Alunos beneficiados', icon: Users, color: 'blue' },
    { value: '< 5s', label: 'Tempo de Execução', description: 'Processamento rápido', icon: Clock, color: 'green' },
    { value: '10', label: 'Disciplinas Ótimas', description: 'Seleção automática', icon: Target, color: 'purple' },
    { value: '50', label: 'Gerações', description: 'Convergência típica', icon: TrendingUp, color: 'orange' }
  ];

  const steps = [
    { step: '1', title: 'Upload dos Dados', description: 'Faça upload da planilha Excel com os dados de reprovações dos alunos.', icon: Upload },
    { step: '2', title: 'Configurar Parâmetros', description: 'Ajuste os parâmetros do algoritmo genético conforme necessário.', icon: Settings },
    { step: '3', title: 'Executar Otimização', description: 'O algoritmo genético encontra a melhor combinação de disciplinas.', icon: Zap },
    { step: '4', title: 'Analisar Resultados', description: 'Visualize os resultados através de gráficos e relatórios detalhados.', icon: BarChart3 }
  ];

  const benefits = [
    'Algoritmo Genético baseado no Problema da Mochila',
    'Maximização do número de alunos beneficiados',
    'Processamento rápido com resultados em tempo real',
    'Interface intuitiva e fácil de usar',
    'Visualizações interativas e exportáveis',
    'Parâmetros configuráveis e adaptáveis'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-6">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">Otimização Inteligente de Disciplinas</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Sistema de Otimização de
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Reoferta de Disciplinas
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Utilize <strong>Algoritmos Genéticos</strong> para identificar o conjunto ótimo de disciplinas 
              que devem ser reofertadas, maximizando o número de alunos beneficiados.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" icon={Upload} onClick={() => navigate('/upload')} className="shadow-2xl shadow-blue-500/50">
                Começar Agora
              </Button>
              <Button variant="outline" size="lg" icon={BarChart3} onClick={() => navigate('/results')}>
                Ver Resultados
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => <StatCard key={index} {...stat} />)}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Funcionalidades</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tudo que você precisa em um só lugar</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Sistema completo para otimização de reoferta com interface moderna e algoritmos avançados</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} hover className="h-full">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-4">
              <Zap className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-600">Como Funciona</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Processo simples em 4 passos</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Da entrada de dados até a análise final, tudo pensado para facilitar seu trabalho</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent -translate-x-4 z-0"></div>
                )}
                <Card className="relative z-10 text-center h-full">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg mb-4 shadow-lg">
                    {step.step}
                  </div>
                  <div className="inline-flex p-3 rounded-xl bg-gray-100 mb-4">
                    <step.icon className="w-8 h-8 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <Award className="w-5 h-5" />
                <span className="text-sm font-semibold">Vantagens</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">Por que escolher nosso sistema?</h2>
              <p className="text-blue-100 text-lg mb-8">Desenvolvido com base em pesquisa acadêmica e testado com dados reais de instituições de ensino.</p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <span className="text-blue-50">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white">
                <h3 className="text-2xl font-bold mb-6">Resultados Comprovados</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Alunos Beneficiados', value: '92%', width: '92%', gradient: 'from-green-400 to-emerald-500' },
                    { label: 'Eficiência por Disciplina', value: '4.6', width: '85%', gradient: 'from-blue-400 to-cyan-500' },
                    { label: 'Tempo de Convergência', value: '~30', width: '60%', gradient: 'from-purple-400 to-pink-500' }
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-200">{item.label}</span>
                        <span className="font-bold text-2xl">{item.value}</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${item.gradient}`} style={{ width: item.width }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-blue-100 text-sm">
                    <strong>Baseado em dados reais:</strong> Testes com datasets de 50+ alunos demonstram convergência consistente e resultados otimizados.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card gradient className="text-center p-12">
            <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pronto para otimizar suas reofertas?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Comece agora e descubra como nosso algoritmo pode ajudar a maximizar o número de alunos beneficiados com a reoferta de disciplinas.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" icon={Upload} onClick={() => navigate('/upload')} className="shadow-2xl shadow-blue-500/50">
                Fazer Upload de Dados
              </Button>
              <Button variant="outline" size="lg" icon={Settings} onClick={() => navigate('/optimization')}>
                Configurar Parâmetros
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default HomePage;
