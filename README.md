# KyoGo

KyoGo é uma aplicação web moderna desenvolvida com Next.js 14, TypeScript e Tailwind CSS, que permite o gerenciamento completo de academias. O sistema oferece funcionalidades para administradores e membros, incluindo busca de academias próximas, sistema de check-in baseado em localização, e um painel administrativo.

## Funcionalidades

- Cadastro e gerenciamento de academias
- Sistema de check-in com validação de localização
- Busca de academias próximas usando geolocalização
- Autenticação com JWT e refresh automático de token
- Controle de acesso baseado em funções (Admin e Membro)
- Interface responsiva com tema escuro
- Feedback visual com toasts para ações do usuário

## Tecnologias utilizadas

![Next.js](https://img.shields.io/badge/next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-%23EC5990.svg?style=for-the-badge&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/zod-%233068b7.svg?style=for-the-badge&logo=zod&logoColor=white)
![Axios](https://img.shields.io/badge/axios-%23646CFF.svg?style=for-the-badge&logo=axios&logoColor=white)

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) (para o backend)

## Instalação

### Backend (API Solid)

Primeiro, clone e configure o backend:

```bash
git clone https://github.com/gabislera/KyoGo-api.git
cd KyoGo-api
npm install
# ou
yarn install

# Configure o ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Inicie o servidor usando Docker Compose
docker-compose up -d
```

O servidor backend estará disponível em [http://localhost:3333](http://localhost:3333).

### Frontend (KyoGo)

Em outro terminal, clone e configure o frontend:

```bash
git clone https://github.com/gabislera/KyoGo.git
cd KyoGo
npm install
# ou
yarn install
```

## Configuração do Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env.local.example .env.local
```

Configure as variáveis de ambiente:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## Execução

Para rodar o projeto em modo de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## Funções do Usuário

### Membros

- Visualizar e buscar academias
- Encontrar academias próximas usando geolocalização
- Realizar check-in em academias (com verificação de localização)
- Visualizar histórico de check-ins
- Acessar métricas pessoais

### Administradores

- Todas as funcionalidades de membro
- Criar novas academias
- Validar check-ins de membros
- Acesso ao painel administrativo

## Variáveis de Ambiente

- `NEXT_PUBLIC_API_URL`: URL do servidor API (obrigatória para comunicação com o backend)

## Build para Produção

```bash
npm run build
npm start
```

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
