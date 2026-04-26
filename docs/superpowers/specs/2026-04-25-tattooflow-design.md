# TattooFlow CRM — Design Spec
**Data:** 2026-04-25  
**Status:** Aprovado

---

## Visão Geral

CRM web completo para estúdios de tatuagem. Cada estúdio tem isolamento total de dados via RLS do Supabase. Interface com Kanban drag-and-drop como tela principal, painel lateral push para detalhes do lead, e visão de lista com filtros.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 + Vite |
| Estilos | Tailwind CSS v3 |
| Banco + Auth | Supabase (PostgreSQL + RLS) |
| Data fetching | TanStack Query v5 |
| Drag-and-drop | @dnd-kit/core + @dnd-kit/sortable |
| Toasts | react-hot-toast |
| Roteamento | React Router v6 |
| Deploy | Vercel |

---

## Decisões de Design Visual

- **Painel lateral:** Push — kanban e painel ficam lado a lado, kanban é comprimido
- **Card do Kanban:** Detalhado com header — header colorido separado com nome e telefone; corpo com origem e dias na etapa
- **Tema:** Charcoal escuro
  - Background: `#111318`
  - Surface: `#1c1e26`
  - Surface elevada: `#272a35`
  - Accent: `#7c3aed` (roxo)
  - Accent suave: `#a78bfa`
  - Texto: `#eeeef2`
  - Texto secundário: `#8888a0`

---

## Arquitetura

```
Supabase DB (PostgreSQL + RLS)
    ↕ supabase-js
lib/supabase.js
    ↕
hooks/ (TanStack Query)
  useLeads.js · useLeadHistory.js · useProfile.js
    ↕
pages/ → components/
```

**Fluxo de autenticação:** Supabase Auth com sessão em localStorage. `App.jsx` usa `supabase.auth.onAuthStateChange` para redirecionar para `/login` se sem sessão ativa. O `studio_id` é sempre `auth.uid()` — nunca passado explicitamente pelo frontend.

**Isolamento multi-tenant:** RLS garante que cada `auth.uid()` só acessa seus próprios registros. Zero lógica de isolamento no frontend.

---

## Estrutura de Arquivos

```
src/
├── lib/
│   └── supabase.js              # cliente Supabase; constantes STAGES, ORIGINS
├── hooks/
│   ├── useLeads.js              # useLeads, useCreateLead, useMoveLeadStage,
│   │                            # useUpdateNotes, useDeleteLead
│   ├── useLeadHistory.js        # useLeadHistory(leadId)
│   └── useProfile.js            # useProfile() → studio_name
├── pages/
│   ├── Login.jsx                # formulário email + senha
│   ├── Register.jsx             # formulário nome do estúdio + email + senha
│   └── Dashboard.jsx            # layout: Header + (KanbanBoard | LeadTable)
│                                # + LeadPanel + LeadModal
├── components/
│   ├── Header.jsx               # nome estúdio, toggle Kanban/Lista, logout
│   ├── KanbanBoard.jsx          # DndContext + renderiza 6 KanbanColumn
│   ├── KanbanColumn.jsx         # DroppableColumn, SortableContext, contador
│   ├── LeadCard.jsx             # card detalhado com header; useSortable
│   ├── LeadModal.jsx            # modal "+ Novo Lead"
│   ├── LeadPanel.jsx            # painel push w-96; detalhes, histórico, notas
│   └── LeadTable.jsx            # tabela com filtros, ordenação
├── App.jsx                      # React Router: /, /login, /register
└── main.jsx                     # entry point: QueryClient + RouterProvider + Toaster
```

---

## Banco de Dados

### Tipos
```sql
create type lead_origin as enum ('anuncio','lp','organico','indicacao');
create type lead_stage  as enum ('novo','contato','orcamento','agendado','fechado','perdido');
```

### Tabelas

**profiles**
```sql
create table profiles (
  id          uuid references auth.users primary key,
  studio_name text not null,
  created_at  timestamptz default now()
);
```

**leads**
```sql
create table leads (
  id         uuid primary key default gen_random_uuid(),
  studio_id  uuid references profiles(id) not null,
  name       text not null,
  phone      text not null,          -- apenas dígitos
  origin     lead_origin not null,
  stage      lead_stage  not null default 'novo',
  notes      text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**lead_history**
```sql
create table lead_history (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references leads(id) on delete cascade,
  from_stage text,
  to_stage   text not null,
  changed_at timestamptz default now()
);
```

### Triggers

**updated_at automático:**
```sql
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger leads_updated_at
before update on leads
for each row execute function update_updated_at();
```

**Criar profile no signup:**
```sql
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles(id, studio_name)
  values (new.id, new.raw_user_meta_data->>'studio_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();
```

### RLS
```sql
alter table profiles     enable row level security;
alter table leads        enable row level security;
alter table lead_history enable row level security;

create policy "own profile" on profiles
  for all using (id = auth.uid());

create policy "own leads" on leads
  for all using (studio_id = auth.uid());

create policy "own history" on lead_history
  for all using (
    lead_id in (select id from leads where studio_id = auth.uid())
  );
```

---

## Telas e Comportamentos

### Autenticação
- `/login` — email + senha. Erro inline se credenciais inválidas.
- `/register` — nome do estúdio + email + senha. Cria user no Supabase Auth com `raw_user_meta_data: { studio_name }`. Trigger cria o profile automaticamente.
- Redirect automático: autenticado → `/`, não autenticado → `/login`.

### Dashboard (`/`)

**Header:**
- Esquerda: logo "TattooFlow" + nome do estúdio
- Centro: toggle Kanban / Lista (botões pill)
- Direita: botão Logout

**Kanban:**

Colunas fixas com cores:

| Stage | Label | Cor do header |
|-------|-------|---------------|
| `novo` | 🟣 Novo Lead | roxo `#7c3aed` |
| `contato` | 🔵 Contato Feito | azul `#3b82f6` |
| `orcamento` | 🟡 Orçamento Enviado | amarelo `#eab308` |
| `agendado` | 🟠 Agendado | laranja `#f97316` |
| `fechado` | 🟢 Fechado | verde `#22c55e` |
| `perdido` | 🔴 Perdido | vermelho `#ef4444` |

- Drag-and-drop entre colunas via dnd-kit
- Atualização otimista: UI move o card imediatamente, TanStack Query invalida após confirmação
- `onDragEnd`: chama `useMoveLeadStage()` → UPDATE `stage` + INSERT `lead_history` + UPDATE `updated_at`
- Mobile: scroll horizontal (`overflow-x: auto`, colunas com `min-width: 280px`)

**Card do lead (design: Detalhado com header):**
```
┌─────────────────────────────┐
│ [HEADER cor da coluna]      │
│  Nome do Lead               │
│  📱 (11) 99999-0000         │
├─────────────────────────────┤
│  🏷️ Origem      │  Xd      │
└─────────────────────────────┘
```
- `updated_at > 3 dias` → `outline-2 outline-red-500` + dias em vermelho com ⚠️
- Clicar no card → abre `LeadPanel`

**Painel lateral (Push, w-96):**
- Abre via `selectedLeadId` no estado do `Dashboard`
- Layout: `transition-all duration-300`, kanban ocupa `flex-1`
- Conteúdo:
  - Nome + botão WhatsApp (`wa.me/55{phone}`, `target="_blank"`)
  - Origem com ícone
  - Data de entrada + tempo total no funil
  - Histórico de movimentações (from → to + timestamp)
  - Textarea de anotações com auto-save (debounce 1000ms) + "Salvo ✓"
  - Select "Mover para..." + botão confirmar
  - Botão "Excluir lead" vermelho com dialog de confirmação nativo
- Fechar: botão X

**Modal "+ Novo Lead":**
- Campos: Nome (required), WhatsApp (required, máscara `(XX) XXXXX-XXXX`), Origem (select)
- Salvar: INSERT lead com `stage = 'novo'` + INSERT `lead_history` (from_stage null, to_stage 'novo')
- Após salvar: fecha modal + toast "Lead criado! [Abrir WhatsApp →]" onde o link no toast abre `wa.me/55{phone}` em nova aba

**Visão de Lista:**
- Tabela: Nome, WhatsApp, Origem, Etapa, Dias no funil, Última atualização
- Filtros: por etapa (multiselect pills), por origem (multiselect), por período (date range)
- Ordenação por coluna (click no header)
- Linha clicável → abre LeadPanel (mesmo painel reutilizado)

---

## Interações Chave

### WhatsApp
```js
const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, '')}`;
```

### Alerta de atraso
```js
const daysSince = (Date.now() - new Date(lead.updated_at)) / 86_400_000;
const isLate = daysSince > 3;
```

### Auto-save de notas
```js
// useRef para o timer, useCallback para o handler
const timerRef = useRef(null);
const handleNotesChange = useCallback((value) => {
  clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => updateNotes(value), 1000);
}, []);
```

### Número de WhatsApp (input)
- Salvo: apenas dígitos (`/\D/g` removidos antes do INSERT)
- Exibido: formatado `(XX) XXXXX-XXXX`
- Máscara aplicada no frontend, banco sempre recebe dígitos limpos

---

## Regras de Negócio

1. Lead sempre entra em `stage = 'novo'`
2. Toda mudança de stage grava em `lead_history` (incluindo criação: `from_stage = null`)
3. `updated_at` atualizado via trigger do banco em qualquer UPDATE
4. `phone` salvo apenas com dígitos; link wa.me montado no frontend
5. Anotações com debounce de 1s; toast "Salvo ✓" após confirmação
6. Isolamento total por `studio_id` via RLS — zero bypass possível pelo frontend

---

## UX e Feedback

- Loading states: skeleton cards enquanto query carrega
- Toasts: lead criado, etapa alterada, anotação salva, lead excluído
- Confirmação de exclusão: `window.confirm()` nativo (simples, sem biblioteca)
- Animações: `transition-all duration-300` no painel, `transition-colors` nos cards durante drag
- Erro de autenticação: mensagem inline abaixo do formulário

---

## Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Entregáveis

1. Código completo de todos os arquivos listados em `src/`
2. `supabase/schema.sql` — SQL completo pronto para colar no Supabase SQL Editor
3. `.env.example`
4. `README.md` com passo a passo: Supabase setup → variáveis → rodar local → deploy Vercel
