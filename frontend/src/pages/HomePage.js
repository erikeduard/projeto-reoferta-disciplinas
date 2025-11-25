import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f7f8] dark:bg-[#101922] overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 dark:border-white/10 px-6 sm:px-10 py-4">
          <div className="flex items-center gap-4 text-gray-900 dark:text-white">
            <div className="w-6 h-6 text-[#137fec]">
              <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.28-.14-1.32-.64-2.9-1.2-1.58-.56-3.11-1.02-4-1.14V11c0-.55-.45-1-1-1H7V8h2c.55 0 1-.45 1-1V5.07c3.95.49 7 3.85 7 7.93 0 .62-.08 1.21-.21 1.79z"></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Sistema de Otimização de Reoferta</h2>
          </div>
        </header>

        <main className="flex-1">
          {/* HeroSection */}
          <div className="container mx-auto">
            <div className="flex flex-col gap-8 px-6 py-16 text-center items-center sm:gap-10 lg:py-24">
              <div className="flex flex-col gap-6 max-w-3xl">
                <div className="flex flex-col gap-4">
                  <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] sm:text-5xl">
                    Otimização da Reoferta de Disciplinas com Algoritmos Genéticos
                  </h1>
                  <h2 className="text-gray-600 dark:text-gray-300 text-lg font-normal leading-normal sm:text-xl">
                    Utilize algoritmos avançados para analisar e sugerir o melhor cronograma de reoferta de disciplinas, maximizando o número de alunos beneficiados.
                  </h2>
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  <button 
                    onClick={() => navigate('/upload')}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-6 bg-[#137fec] hover:bg-[#0f6dd4] text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span className="truncate">Iniciar Nova Análise</span>
                  </button>
                  <button 
                    onClick={() => navigate('/history')}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-6 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                    </svg>
                    <span className="truncate">Ver Análises Anteriores</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex flex-col gap-6 px-5 py-10 text-center border-t border-gray-200 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal hover:text-[#137fec] dark:hover:text-[#137fec] transition-colors cursor-pointer">
              Documentação
            </a>
            <a className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal hover:text-[#137fec] dark:hover:text-[#137fec] transition-colors cursor-pointer">
              Sobre
            </a>
            <a className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal hover:text-[#137fec] dark:hover:text-[#137fec] transition-colors cursor-pointer">
              Contato
            </a>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
            © 2025 Sistema de Otimização. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
