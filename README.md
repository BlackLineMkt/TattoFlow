# TattooFlow

CRM para estúdios de tatuagem. Kanban drag-and-drop, painel lateral push, histórico de movimentações, anotações com auto-save e isolamento total de dados por estúdio.

## Stack

- React 18 + Vite + Tailwind CSS (tema Charcoal escuro + roxo)
- Supabase — PostgreSQL + Auth + RLS (isolamento multi-tenant)
- TanStack Query v5 — cache e data fetching
- @dnd-kit — drag-and-drop acessível
- react-hot-toast — notificações
- Deploy: Vercel

---

## Setup

### 1. Crie um projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **New Project**, escolha nome, senha e região
3. Aguarde inicializar (~2 min)

### 2. Rode o schema SQL

1. No painel Supabase → **SQL Editor**
2. Cole todo o conteúdo de `supabase/schema.sql`
3. Clique em **Run**
4. Verifique no **Table Editor**: tabelas `profiles`, `leads` e `lead_history` criadas

> **Dica:** Para desenvolvimento local sem confirmação de email, desabilite em  
> Supabase → **Authentication → Providers → Email → Confirm email**

### 3. Configure variáveis de ambiente

```bash
cp .env.example .env
```

Preencha `.env` com os valores do seu projeto:

- **URL**: Supabase → Project Settings → API → Project URL  
- **Anon Key**: Supabase → Project Settings → API → Project API Keys → `anon public`

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Rode localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173).  
Cadastre um estúdio em `/register` → confirme o email → faça login.

### 5. Deploy na Vercel

1. Faça push para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) → **Add New Project** → importe o repositório
3. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Clique em **Deploy**

A Vercel detecta o Vite automaticamente. Build: `npm run build` → output: `dist/`.

---

## Comandos

```bash
npm run dev      # servidor de desenvolvimento (porta 5173)
npm run build    # build de produção
npm run preview  # preview local do build
npm test         # testes unitários (Vitest)
```

## Estrutura

```
src/
├── lib/
│   ├── supabase.js      # cliente Supabase + constantes STAGES e ORIGINS
│   ├── utils.js         # funções puras: formatPhone, buildWhatsAppUrl, isLate...
│   └── utils.test.js    # testes Vitest
├── hooks/
│   ├── useLeads.js      # useLeads, useCreateLead, useMoveLeadStage, useUpdateNotes, useDeleteLead
│   ├── useLeadHistory.js
│   └── useProfile.js
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Dashboard.jsx    # layout principal
└── components/
    ├── Header.jsx
    ├── KanbanBoard.jsx  # DndContext + colunas
    ├── KanbanColumn.jsx # coluna droppable
    ├── LeadCard.jsx     # card draggable
    ├── LeadModal.jsx    # "+ Novo Lead"
    ├── LeadPanel.jsx    # painel push lateral
    └── LeadTable.jsx    # visão lista com filtros
supabase/
└── schema.sql           # SQL completo: enums, tabelas, triggers, RLS
```

## Funcionalidades

- **Kanban** com 6 etapas: Novo Lead → Contato → Orçamento → Agendado → Fechado → Perdido
- **Drag-and-drop** entre colunas com feedback visual
- **Alerta de atraso**: card com borda vermelha se +3 dias sem movimentação
- **Painel push lateral**: detalhes, histórico de etapas, anotações com auto-save (1s)
- **Visão Lista**: tabela com filtros por etapa, origem, período; ordenação por coluna
- **WhatsApp**: link direto `wa.me/55{numero}` no card e no painel
- **Multi-tenant**: cada estúdio vê apenas seus próprios leads (RLS)
