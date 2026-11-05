# KORVIL APP

Aplicação web do ecossistema Korvil — Central Korvil, K-AI, S.O.K (Sistema Operacional Korvil), Loja, OMFOME, Cursos e mais.

## Como rodar

### Opção 1: Docker (recomendado)

```bash
docker compose up -d --build
```

O projeto sobe em **http://localhost:3000**.

Para parar:
```bash
docker compose down
```

### Opção 2: Setup automático

```bash
./scripts/setup.sh
```

O script:
1. Cria `.env` a partir do `.env.example` (na primeira vez)
2. Instala as dependências
3. Sobe o projeto com Docker (ou faz build local se Docker não estiver instalado)

### Opção 3: Desenvolvimento

```bash
npm install
npm run dev
```

## Portabilidade

**Pra transferir é só copiar a pasta e rodar `docker compose up`.**

Toda a configuração fica no arquivo `.env`:
- Credenciais do Supabase
- Token do bot do Telegram
- ID do grupo KBD
- Chaves de API (GitHub, Resend, Evolution, Groq, Gemini)

Não precisa de backup externo — o `.env` já é o backup. Copie a pasta, rode o setup, e tudo funciona.

## Variáveis de ambiente

Veja `.env.example` para a lista completa. Principais:

| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase |
| `TELEGRAM_BOT_TOKEN` | Token do bot do Telegram (K-B.D) |
| `TELEGRAM_CHANNEL_ID` | ID do canal do Telegram |
| `KBD_GROUP_ID` | ID do grupo KBD com tópicos (-1004309623076) |
| `VITE_GH_OWNER` / `VITE_GH_REPO` | Repositório GitHub de backup |

## Estrutura

- **Central Korvil** — tela inicial com todos os setores
- **S.O.K** — Sistema Operacional Korvil (admin): Painel, K-AI, K-B.D, K-O.R
- **K-B.D** — banco de dados de arquivos via Telegram (grupo KBD com tópicos por setor)
- **Loja** — marketplace Korvil
- **OMFOME** — delivery
- **Cursos** — plataforma de cursos

## Tecnologias

- React + TypeScript + Vite
- Tailwind CSS
- Supabase (banco de dados + auth + edge functions)
- Telegram Bot API (armazenamento de arquivos do K-B.D)
- Docker + Nginx (deploy)
