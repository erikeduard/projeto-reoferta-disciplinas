// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { 
  Upload, 
  Settings, 
  BarChart3, 
  History, 
  Home,
  BookOpen,
  Github
} from 'lucide-react';

// Importar páginas
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import OptimizationPage from './pages/OptimizationPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';

// Componente de navegação
const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/optimization', icon: Settings, label: 'Otimização' },
    { path: '/results', icon: BarChart3, label: 'Resultados' },
    { path: '/history', icon: History, label: 'Histórico' }
  ];

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-300" />
            <div>
              <h1 className="text-xl font-bold">ReOferta</h1>
              <p className="text-xs text-blue-300">Otimização de Disciplinas</p>
            </div>
          </div>

          {/* Menu de navegação */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(path)
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* GitHub link */}
          <a
            href="https://github.com/seu-usuario/projeto-reoferta"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-blue-200 hover:text-white transition-colors"
          >
            <Github className="h-5 w-5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>

        {/* Menu mobile */}
        <div className="md:hidden">
          <div className="flex space-x-4 pb-4 overflow-x-auto">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-xs whitespace-nowrap ${
                  isActive(path)
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Componente de rodapé
const Footer = () => (
  <footer className="bg-gray-800 text-white py-8 mt-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Sobre o Projeto</h3>
          <p className="text-gray-300 text-sm">
            Sistema de otimização de reoferta de disciplinas utilizando algoritmos genéticos, 
            baseado na abordagem do problema da mochila.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Funcionalidades</h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>• Upload de dados Excel</li>
            <li>• Algoritmo genético customizável</li>
            <li>• Visualizações interativas</li>
            <li>• Relatórios detalhados</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Tecnologias</h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>• React & Tailwind CSS</li>
            <li>• Node.js & Express</li>
            <li>• Docker & Docker Compose</li>
            <li>• Recharts para visualizações</li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-700 pt-6 mt-8 text-center text-gray-400 text-sm">
        <p>&copy; 2025 Sistema de Otimização de Reoferta de Disciplinas. Desenvolvido como projeto de TCC.</p>
      </div>
    </div>
  </footer>
);

// Componente principal da aplicação
const App = () => {
  const [globalState, setGlobalState] = useState({
    uploadedFile: null,
    optimizationResult: null,
    isLoading: false
  });

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route 
            path="/" 
            element={<HomePage />} 
          />
          <Route 
            path="/upload" 
            element={
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navigation />
                <main className="flex-grow">
                  <UploadPage 
                    globalState={globalState}
                    setGlobalState={setGlobalState}
                  />
                </main>
                <Footer />
              </div>
            } 
          />
          <Route 
            path="/optimization" 
            element={
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navigation />
                <main className="flex-grow">
                  <OptimizationPage 
                    globalState={globalState}
                    setGlobalState={setGlobalState}
                  />
                </main>
                <Footer />
              </div>
            } 
          />
          <Route 
            path="/results" 
            element={
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navigation />
                <main className="flex-grow">
                  <ResultsPage 
                    globalState={globalState}
                    setGlobalState={setGlobalState}
                  />
                </main>
                <Footer />
              </div>
            } 
          />
          <Route 
            path="/history" 
            element={
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navigation />
                <main className="flex-grow">
                  <HistoryPage />
                </main>
                <Footer />
              </div>
            } 
          />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;