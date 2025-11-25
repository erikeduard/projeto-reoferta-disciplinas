# 🎓 Sistema de Otimização de Reoferta de Disciplinas

Sistema completo para otimização da reoferta de disciplinas em cursos de graduação utilizando **Algoritmos Genéticos**, baseado na abordagem do **Problema da Mochila**.

## 📋 Sobre o Projeto

Este projeto implementa a solução desenvolvida na monografia *"Otimização da Reoferta de Disciplinas em Curso de Ciência da Computação utilizando Algoritmos Genéticos"*. O sistema analisa dados de reprovações de alunos e utiliza algoritmos genéticos para identificar o conjunto ótimo de disciplinas que devem ser reofertadas, maximizando o número de alunos beneficiados.

### 🎯 Funcionalidades Principais

- **Upload de Planilhas**: Interface para upload de dados de reprovações em formato Excel
- **Algoritmo Genético**: Implementação otimizada com parâmetros configuráveis
- **Visualizações**: Gráficos interativos dos resultados da otimização
- **API RESTful**: Backend completo para processamento de dados
- **Interface Web**: Frontend React moderno e responsivo
- **Containerização**: Deploy completo com Docker

## 🚀 Início Rápido

### Pré-requisitos

- Docker (>= 20.10)
- Docker Compose (>= 2.0)
- Make (opcional, para comandos simplificados)

### 1. Clone e Configure

```bash
git clone <url-do-repositorio>
cd projeto-reoferta-disciplinas

# Configuração inicial
make setup
# ou manualmente:
cp .env.example .env
mkdir -p backend/{uploads,results,logs} backups
```

### 2. Inicie o Sistema

```bash
# Com Make (recomendado)
make dev

# Ou com Docker Compose diretamente
docker-compose up --build
```

### 3. Acesse a Aplicação

- **Frontend**: http://localhost
- **API**: http://localhost/api
- **Health Check**: http://localhost/health

## 📊 Como Usar

### 1. Upload de Dados

1. Acesse a interface web
2. Faça upload da planilha Excel com dados de reprovações
3. O sistema processará automaticamente os dados

### 2. Configurar Parâmetros

- **Tamanho da População**: Número de indivíduos na população (padrão: 100)
- **Máximo de Gerações**: Número máximo de iterações (padrão: 50)
- **Taxa de Crossover**: Probabilidade de recombinação (padrão: 80%)
- **Taxa de Mutação**: Probabilidade de mutação (padrão: 20%)
- **Máximo de Disciplinas**: Limite de disciplinas para reoferta (padrão: 10)

### 3. Executar Otimização

1. Configure os parâmetros desejados
2. Execute o algoritmo genético
3. Visualize os resultados em tempo real

### 4. Analisar Resultados

- **Gráficos de Convergência**: Evolução da aptidão ao longo das gerações
- **Disciplinas Selecionadas**: Lista das disciplinas escolhidas para reoferta
- **Estatísticas**: Número de alunos beneficiados, eficiência da solução
- **Análise por Semestre**: Distribuição das disciplinas por período do curso

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │────│   Frontend      │────│    Backend      │
│  (Proxy/Load    │    │   (React)       │    │  (Node.js/API)  │
│   Balancer)     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│   Visualização  │──────────────┘
                        │   (Recharts)    │
                        └─────────────────┘
                                 │
                   ┌─────────────────────────────┐
                   │   Algoritmo Genético        │
                   │   - Seleção por Torneio     │
                   │   - Crossover de Ponto      │
                   │   - Mutação Bitwise         │
                   │   - Elitismo                │
                   └─────────────────────────────┘
```

### Componentes

- **Frontend (React)**: Interface do usuário moderna e responsiva
- **Backend (Node.js/Express)**: API RESTful com processamento de dados
- **Nginx**: Reverse proxy e load balancer
- **Algoritmo Genético**: Core da otimização, implementado em JavaScript

## 🛠️ Comandos Disponíveis

### Desenvolvimento

```bash
make dev          # Inicia ambiente de desenvolvimento
make dev-bg       # Inicia em background
make logs         # Visualiza logs
make logs-api     # Logs apenas do backend
```

### Produção

```bash
make prod         # Deploy de produção
make build        # Constrói imagens
make restart      # Reinicia serviços
```

### Manutenção

```bash
make clean        # Limpa containers parados
make backup       # Cria backup dos dados
make test         # Executa testes
make lint         # Verifica código
```

### Debug

```bash
make shell-api    # Acessa shell do backend
make status       # Status dos containers
make health       # Verifica saúde da aplicação
```

## 📁 Estrutura do Projeto

```
projeto-reoferta-disciplinas/
├── docker-compose.yml          # Orquestração dos serviços
├── Makefile                    # Comandos automatizados
├── README.md                   # Esta documentação
│
├── backend/                    # Backend Node.js
│   ├── src/
│   │   ├── algoritmoGenetico.js    # Implementação do AG
│   │   ├── dataProcessor.js        # Processamento de dados
│   │   └── server.js              # Servidor Express
│   ├── uploads/                # Arquivos enviados
│   ├── results/                # Resultados salvos
│   └── logs/                   # Logs da aplicação
│
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── pages/             # Páginas da aplicação
│   │   └── services/          # Serviços de API
│   └── public/                # Arquivos públicos
│
└── nginx/                     # Configuração do proxy
    └── default.conf           # Configuração do Nginx
```

## 🧬 Algoritmo Genético

### Implementação

O algoritmo genético implementado utiliza:

- **Representação**: Cromossomo binário (1 = reofertar disciplina, 0 = não reofertar)
- **Seleção**: Torneio com tamanho configurável
- **Crossover**: Ponto único com taxa configurável
- **Mutação**: Inversão de bits com taxa configurável  
- **Elitismo**: Preservação dos melhores indivíduos entre gerações

### Função de Aptidão

```javascript
aptidao = (alunosBeneficiados × 100) + disciplinasAtendidas - penalizacao
```

Onde:
- `alunosBeneficiados`: Número de alunos que terão pelo menos uma disciplina atendida
- `disciplinasAtendidas`: Total de disciplinas atendidas considerando capacidade dos alunos
- `penalizacao`: Penalização por exceder limite máximo de disciplinas

### Parâmetros Otimizados

Baseado em experimentos, os parâmetros padrão são:

| Parâmetro | Valor | Justificativa |
|-----------|-------|---------------|
| População | 100 | Equilíbrio entre diversidade e performance |
| Gerações | 50 | Convergência típica em ~30 gerações |
| Crossover | 80% | Alta exploração do espaço de soluções |
| Mutação | 20% | Manutenção da diversidade genética |
| Elitismo | 10% | Preservação das melhores soluções |

## 📈 Resultados Esperados

Com base nos testes realizados, o sistema tipicamente achieve:

- **92%** dos alunos com reprovações beneficiados
- **Convergência** em aproximadamente 30 gerações
- **Eficiência** de 4,6 alunos beneficiados por disciplina reofertada
- **Tempo de execução** < 5 segundos para datasets de 50 alunos

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```bash
# Backend
NODE_ENV=production
PORT=3001
MAX_FILE_SIZE=10485760  # 10MB

# Algoritmo Genético
DEFAULT_POPULATION_SIZE=100
DEFAULT_MAX_GENERATIONS=50
DEFAULT_CROSSOVER_RATE=0.8
DEFAULT_MUTATION_RATE=0.2

# Logging
LOG_LEVEL=info
```

### Personalização do Algoritmo

Para ajustar o algoritmo para diferentes contextos:

1. **Função de Aptidão**: Modifique os pesos em `algoritmoGenetico.js`
2. **Operadores Genéticos**: Implemente novos operadores de crossover/mutação
3. **Critérios de Parada**: Adicione convergência prematura baseada em diversidade

## 🧪 Testes

```bash
# Executar todos os testes
make test

# Testes com cobertura
make test-coverage

# Testes específicos
docker-compose exec api npm test algoritmoGenetico.test.js
```

### Casos de Teste Incluídos

- ✅ Processamento de planilhas Excel
- ✅ Validação de dados de entrada
- ✅ Execução do algoritmo genético
- ✅ Cálculo de função de aptidão
- ✅ Operadores genéticos (crossover, mutação)
- ✅ Endpoints da API

## 🐛 Troubleshooting

### Problemas Comuns

**1. Erro de permissão nos volumes**
```bash
sudo chown -R $USER:$USER backend/uploads backend/results
```

**2. Porta já em uso**
```bash
# Verificar processos na porta 80
sudo lsof -i :80
# Parar serviços conflitantes ou alterar porta no docker-compose.yml
```

**3. Arquivo Excel não reconhecido**
- Verifique se o arquivo tem extensão `.xlsx` ou `.xls`
- Certifique-se de que existe uma planilha com dados de reprovações
- Verifique se as colunas seguem o padrão `CCCD0001 - NOME DA DISCIPLINA`

**4. Algoritmo não converge**
- Aumente o número de gerações
- Ajuste taxa de mutação (valores muito baixos causam convergência prematura)
- Verifique se há dados suficientes para otimização

### Logs e Monitoramento

```bash
# Logs em tempo real
make logs

# Logs específicos por serviço
make logs-api
make logs-frontend
make logs-nginx

# Status dos containers
make status

# Estatísticas de uso
make stats
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padrões de Código

- **Backend**: ESLint + Prettier
- **Frontend**: ESLint + Prettier + React best practices
- **Commits**: Conventional Commits
- **Testes**: Jest para backend, React Testing Library para frontend



## 👥 Autores

- **Erik Pires** - *Desenvolvimento inicial* - [SeuGitHub](https://github.com/erikeduard)

## 🙏 Agradecimentos

- Orientador da monografia
- Instituição de ensino
- Comunidade de desenvolvedores de algoritmos evolutivos
- Contribuidores do projeto

## 📚 Referências

- Holland, J.H. (1975). "Adaptation in natural and artificial systems"
- Goldberg, D.E. (1989). "Genetic algorithms in search, optimization, and machine learning"
- Mitchell, M. (1998). "An introduction to genetic algorithms"

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela!**
