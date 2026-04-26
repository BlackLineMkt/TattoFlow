# TattooFlow CRM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build TattooFlow, a complete dark-themed CRM web app for tattoo studios with Kanban drag-and-drop, lead management, and multi-studio isolation via Supabase RLS.

**Architecture:** React 18 + Vite frontend; TanStack Query v5 for server-state cache; Supabase JS v2 for PostgreSQL + Auth + RLS; dnd-kit for drag-and-drop; Dashboard uses a push side panel (kanban compresses, panel opens alongside). Custom Tailwind color tokens used throughout.

**Tech Stack:** React 18, Vite 5, Tailwind CSS v3, Supabase JS v2, TanStack Query v5, @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities, react-hot-toast, React Router v6, Vitest + @testing-library/react + @testing-library/jest-dom

---

## File Map

| File | Responsibility |
|------|----------------|
| `index.html` | HTML entry point; Inter font via Google Fonts `<link>` |
| `vite.config.js` | Vite + Vitest (jsdom) config |
| `tailwind.config.js` | Custom color tokens: bg, surface, elevated, accent, accent-light, primary, muted |
| `postcss.config.js` | PostCSS with tailwindcss + autoprefixer |
| `src/index.css` | Tailwind directives |
| `src/test-setup.js` | @testing-library/jest-dom import |
| `src/main.jsx` | Entry: QueryClient + BrowserRouter + Toaster |
| `src/App.jsx` | React Router routes + auth guard (loading → login → dashboard) |
| `src/lib/supabase.js` | Supabase client + STAGES array + ORIGINS array |
| `src/lib/utils.js` | Pure fns: cleanPhone, formatPhone, buildWhatsAppUrl, getDaysSince, isLate |
| `src/lib/utils.test.js` | Vitest unit tests for all utils |
| `src/hooks/useProfile.js` | useProfile() → { studio_name } |
| `src/hooks/useLeads.js` | useLeads, useCreateLead, useMoveLeadStage, useUpdateNotes, useDeleteLead |
| `src/hooks/useLeadHistory.js` | useLeadHistory(leadId) |
| `src/pages/Login.jsx` | Email + password sign-in form |
| `src/pages/Register.jsx` | Studio name + email + password sign-up form |
| `src/pages/Dashboard.jsx` | Layout: Header + main area + push panel + FAB + modal |
| `src/components/Header.jsx` | Studio name, Kanban/Lista toggle, Sair button |
| `src/components/LeadCard.jsx` | Draggable card: colored header + body with origin + days |
| `src/components/KanbanColumn.jsx` | Droppable column with SortableContext + counter |
| `src/components/KanbanBoard.jsx` | DndContext + 6 KanbanColumns + DragOverlay |
| `src/components/LeadModal.jsx` | "+ Novo Lead" modal (name, WhatsApp, origin) |
| `src/components/LeadPanel.jsx` | Push side panel: contact, origin, dates, move, notes, history, delete |
| `src/components/LeadTable.jsx` | List view with multiselect filters, date range, sortable columns |
| `supabase/schema.sql` | Types, tables, triggers (updated_at + profile creation), RLS policies |
| `.env.example` | Supabase env var template |
| `README.md` | Supabase setup → env vars → local dev → Vercel deploy |

---

## Task 1: Project Scaffold

**Files:**
- Create: `index.html`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/index.css`
- Create: `src/test-setup.js`
- Create: `package.json` (via npm commands)

- [ ] **Step 1: Scaffold Vite project in current directory**

Run from `D:/Bl vs code`:
```bash
npm create vite@latest . -- --template react
```
When prompted about non-empty directory, choose **"Ignore files and continue"**. Choose **React** and **JavaScript**.

- [ ] **Step 2: Install all dependencies**

```bash
npm install
npm install @supabase/supabase-js @tanstack/react-query @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-hot-toast react-router-dom
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Install and init Tailwind**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 4: Overwrite `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
  },
})
```

- [ ] **Step 5: Overwrite `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#111318',
        surface: '#1c1e26',
        elevated: '#272a35',
        accent: '#7c3aed',
        'accent-light': '#a78bfa',
        primary: '#eeeef2',
        muted: '#8888a0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 6: Overwrite `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: Overwrite `index.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>TattooFlow</title>
  </head>
  <body class="bg-bg">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `src/test-setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 9: Add test script to `package.json`**

Open `package.json`, find the `"scripts"` section and add:
```json
"test": "vitest"
```
So `"scripts"` becomes:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest"
}
```

- [ ] **Step 10: Verify dev server starts**

```bash
npm run dev
```
Expected: server starts on `http://localhost:5173`, browser shows Vite default page.

- [ ] **Step 11: Create directory structure**

```bash
mkdir -p src/lib src/hooks src/pages src/components supabase
```

- [ ] **Step 12: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Vite + React + Tailwind + dnd-kit + TanStack Query"
```

---

## Task 2: Supabase Schema SQL

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: Create `supabase/schema.sql`**

```sql
-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Enums
create type lead_origin as enum ('anuncio', 'lp', 'organico', 'indicacao');
create type lead_stage  as enum ('novo', 'contato', 'orcamento', 'agendado', 'fechado', 'perdido');

-- profiles: one per authenticated user / studio
create table profiles (
  id          uuid references auth.users on delete cascade primary key,
  studio_name text not null,
  created_at  timestamptz default now()
);

-- leads
create table leads (
  id         uuid primary key default gen_random_uuid(),
  studio_id  uuid references profiles(id) on delete cascade not null,
  name       text not null,
  phone      text not null,
  origin     lead_origin not null,
  stage      lead_stage  not null default 'novo',
  notes      text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- lead_history: log of every stage change
create table lead_history (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references leads(id) on delete cascade not null,
  from_stage text,
  to_stage   text not null,
  changed_at timestamptz default now()
);

-- Trigger: keep updated_at current on any leads UPDATE
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- Trigger: auto-create profile when a new user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, studio_name)
  values (new.id, new.raw_user_meta_data ->> 'studio_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Row Level Security
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

- [ ] **Step 2: Verify SQL in Supabase**

In the Supabase dashboard, open **SQL Editor** and paste the entire file. Click **Run**. Expected: all statements execute without error. Check **Table Editor** — you should see `profiles`, `leads`, `lead_history`.

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add Supabase schema with RLS and triggers"
```

---

## Task 3: Supabase Client + Constants

**Files:**
- Create: `src/lib/supabase.js`

- [ ] **Step 1: Create `.env` from template**

Create `.env` in the project root:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```
Replace with your actual Supabase project URL and anon key (found in Supabase → Project Settings → API).

- [ ] **Step 2: Create `src/lib/supabase.js`**

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const STAGES = [
  { id: 'novo',      label: '🟣 Novo Lead',        color: '#7c3aed' },
  { id: 'contato',   label: '🔵 Contato Feito',     color: '#3b82f6' },
  { id: 'orcamento', label: '🟡 Orçamento Enviado', color: '#eab308' },
  { id: 'agendado',  label: '🟠 Agendado',          color: '#f97316' },
  { id: 'fechado',   label: '🟢 Fechado',           color: '#22c55e' },
  { id: 'perdido',   label: '🔴 Perdido',           color: '#ef4444' },
]

export const ORIGINS = [
  { id: 'anuncio',   label: 'Anúncio',      icon: '📢' },
  { id: 'lp',        label: 'Landing Page', icon: '🔗' },
  { id: 'organico',  label: 'Orgânico',     icon: '🌱' },
  { id: 'indicacao', label: 'Indicação',    icon: '👥' },
]
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.js .env
git commit -m "feat: add Supabase client and STAGES/ORIGINS constants"
```

---

## Task 4: Utility Functions (TDD)

**Files:**
- Create: `src/lib/utils.js`
- Create: `src/lib/utils.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/utils.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { cleanPhone, formatPhone, buildWhatsAppUrl, getDaysSince, isLate } from './utils'

describe('cleanPhone', () => {
  it('removes all non-digit characters', () => {
    expect(cleanPhone('(11) 99999-8888')).toBe('11999998888')
    expect(cleanPhone('11999998888')).toBe('11999998888')
    expect(cleanPhone('+55 (11) 99999-8888')).toBe('5511999998888')
  })
})

describe('formatPhone', () => {
  it('formats 11-digit number as (XX) XXXXX-XXXX', () => {
    expect(formatPhone('11999998888')).toBe('(11) 99999-8888')
  })
  it('formats 10-digit number as (XX) XXXX-XXXX', () => {
    expect(formatPhone('1199998888')).toBe('(11) 9999-8888')
  })
  it('returns raw digits if not 10 or 11 digits', () => {
    expect(formatPhone('123')).toBe('123')
    expect(formatPhone('')).toBe('')
  })
  it('cleans non-digits before formatting', () => {
    expect(formatPhone('(11) 99999-8888')).toBe('(11) 99999-8888')
  })
})

describe('buildWhatsAppUrl', () => {
  it('prepends country code 55 and builds wa.me URL', () => {
    expect(buildWhatsAppUrl('11999998888')).toBe('https://wa.me/5511999998888')
  })
  it('cleans non-digit chars before building URL', () => {
    expect(buildWhatsAppUrl('(11) 99999-8888')).toBe('https://wa.me/5511999998888')
  })
})

describe('getDaysSince', () => {
  it('returns 0 for a date just now', () => {
    expect(getDaysSince(new Date().toISOString())).toBe(0)
  })
  it('returns 2 for a date 2 days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString()
    expect(getDaysSince(twoDaysAgo)).toBe(2)
  })
})

describe('isLate', () => {
  it('returns false for leads updated today', () => {
    expect(isLate(new Date().toISOString())).toBe(false)
  })
  it('returns false for leads updated 3 days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString()
    expect(isLate(threeDaysAgo)).toBe(false)
  })
  it('returns true for leads updated more than 3 days ago', () => {
    const fourDaysAgo = new Date(Date.now() - 4 * 86_400_000).toISOString()
    expect(isLate(fourDaysAgo)).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: tests fail with `Cannot find module './utils'`.

- [ ] **Step 3: Implement `src/lib/utils.js`**

```js
export function cleanPhone(phone) {
  return phone.replace(/\D/g, '')
}

export function formatPhone(phone) {
  const digits = cleanPhone(phone)
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return digits
}

export function buildWhatsAppUrl(phone) {
  return `https://wa.me/55${cleanPhone(phone)}`
}

export function getDaysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

export function isLate(updatedAt) {
  return getDaysSince(updatedAt) > 3
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```
Expected: all 10 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.js src/lib/utils.test.js
git commit -m "feat: add utility functions with full test coverage"
```

---

## Task 5: Data Hooks

**Files:**
- Create: `src/hooks/useProfile.js`
- Create: `src/hooks/useLeads.js`
- Create: `src/hooks/useLeadHistory.js`

- [ ] **Step 1: Create `src/hooks/useProfile.js`**

```js
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single()
      if (error) throw error
      return data
    },
  })
}
```

- [ ] **Step 2: Create `src/hooks/useLeads.js`**

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase, STAGES } from '../lib/supabase'
import { buildWhatsAppUrl } from '../lib/utils'

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, phone, origin }) => {
      const { data: { session } } = await supabase.auth.getSession()
      const { data, error } = await supabase
        .from('leads')
        .insert({ name, phone, origin, stage: 'novo', studio_id: session.user.id })
        .select()
        .single()
      if (error) throw error
      await supabase.from('lead_history').insert({
        lead_id: data.id,
        from_stage: null,
        to_stage: 'novo',
      })
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      const url = buildWhatsAppUrl(data.phone)
      toast.success(
        <span>
          Lead criado!{' '}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'underline', fontWeight: 600 }}
          >
            Abrir WhatsApp →
          </a>
        </span>
      )
    },
    onError: () => toast.error('Erro ao criar lead'),
  })
}

export function useMoveLeadStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ lead, toStage }) => {
      const { error } = await supabase
        .from('leads')
        .update({ stage: toStage })
        .eq('id', lead.id)
      if (error) throw error
      await supabase.from('lead_history').insert({
        lead_id: lead.id,
        from_stage: lead.stage,
        to_stage: toStage,
      })
    },
    onSuccess: (_data, { toStage }) => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      const stage = STAGES.find(s => s.id === toStage)
      toast.success(`Movido para ${stage?.label ?? toStage}`)
    },
    onError: () => toast.error('Erro ao mover lead'),
  })
}

export function useUpdateNotes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ leadId, notes }) => {
      const { error } = await supabase
        .from('leads')
        .update({ notes })
        .eq('id', leadId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Salvo ✓', { duration: 1500 })
    },
    onError: () => toast.error('Erro ao salvar anotação'),
  })
}

export function useDeleteLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (leadId) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead excluído')
    },
    onError: () => toast.error('Erro ao excluir lead'),
  })
}
```

- [ ] **Step 3: Create `src/hooks/useLeadHistory.js`**

```js
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useLeadHistory(leadId) {
  return useQuery({
    queryKey: ['lead_history', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_history')
        .select('*')
        .eq('lead_id', leadId)
        .order('changed_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!leadId,
  })
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/
git commit -m "feat: add TanStack Query hooks for leads, profile, and history"
```

---

## Task 6: Entry Point and Routing

**Files:**
- Overwrite: `src/main.jsx`
- Create: `src/App.jsx`

- [ ] **Step 1: Overwrite `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1c1e26',
              color: '#eeeef2',
              border: '1px solid #272a35',
              fontSize: '14px',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
```

- [ ] **Step 2: Create `src/App.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function Spinner() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return <Spinner />

  return (
    <Routes>
      <Route
        path="/login"
        element={session ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={session ? <Navigate to="/" replace /> : <Register />}
      />
      <Route
        path="/"
        element={session ? <Dashboard /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/main.jsx src/App.jsx
git commit -m "feat: add entry point, QueryClient, and auth-guarded routes"
```

---

## Task 7: Auth Pages

**Files:**
- Create: `src/pages/Login.jsx`
- Create: `src/pages/Register.jsx`

- [ ] **Step 1: Create `src/pages/Login.jsx`**

```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-accent">TattooFlow</h1>
          <p className="text-muted text-sm mt-1">Acesse o CRM do seu estúdio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-surface border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-surface border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-muted text-sm text-center mt-6">
          Estúdio novo?{' '}
          <Link to="/register" className="text-accent-light hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/pages/Register.jsx`**

```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Register() {
  const [studioName, setStudioName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { studio_name: studioName } },
    })
    if (error) setError(error.message)
    else setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-accent mb-3">TattooFlow</h1>
          <p className="text-primary font-medium">Conta criada!</p>
          <p className="text-muted text-sm mt-2">
            Verifique seu email para confirmar a conta e depois{' '}
            <Link to="/login" className="text-accent-light hover:underline">
              faça login
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-accent">TattooFlow</h1>
          <p className="text-muted text-sm mt-1">Crie a conta do seu estúdio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
              Nome do Estúdio
            </label>
            <input
              type="text"
              value={studioName}
              onChange={e => setStudioName(e.target.value)}
              required
              className="w-full bg-surface border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="Ex: Dark Art Tattoo"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-surface border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-surface border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-muted text-sm text-center mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-accent-light hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`. Open `http://localhost:5173/login` — confirm the dark login form renders. Open `/register` — confirm it renders. Check that the toggle link navigates between both pages.

- [ ] **Step 4: Commit**

```bash
git add src/pages/
git commit -m "feat: add Login and Register pages with Supabase Auth"
```

---

## Task 8: Header Component

**Files:**
- Create: `src/components/Header.jsx`

- [ ] **Step 1: Create `src/components/Header.jsx`**

```jsx
import { supabase } from '../lib/supabase'
import { useProfile } from '../hooks/useProfile'

export default function Header({ view, onViewChange }) {
  const { data: profile } = useProfile()

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <header className="flex items-center gap-4 px-6 py-3 bg-surface border-b border-elevated flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-bold text-accent text-lg tracking-tight">TattooFlow</span>
        {profile?.studio_name && (
          <span className="text-muted text-sm truncate">· {profile.studio_name}</span>
        )}
      </div>

      <div className="mx-auto flex gap-1 bg-elevated rounded-lg p-1">
        <button
          onClick={() => onViewChange('kanban')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            view === 'kanban'
              ? 'bg-accent text-white'
              : 'text-muted hover:text-primary'
          }`}
        >
          Kanban
        </button>
        <button
          onClick={() => onViewChange('list')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            view === 'list'
              ? 'bg-accent text-white'
              : 'text-muted hover:text-primary'
          }`}
        >
          Lista
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="text-muted hover:text-primary text-sm transition-colors ml-auto"
      >
        Sair
      </button>
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.jsx
git commit -m "feat: add Header with view toggle and logout"
```

---

## Task 9: LeadCard Component

**Files:**
- Create: `src/components/LeadCard.jsx`

- [ ] **Step 1: Create `src/components/LeadCard.jsx`**

```jsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { STAGES, ORIGINS } from '../lib/supabase'
import { formatPhone, getDaysSince, isLate } from '../lib/utils'

export default function LeadCard({ lead, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const stage = STAGES.find(s => s.id === lead.stage)
  const origin = ORIGINS.find(o => o.id === lead.origin)
  const days = getDaysSince(lead.updated_at)
  const late = isLate(lead.updated_at)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg overflow-hidden select-none transition-all ${
        isDragging ? 'opacity-40 shadow-2xl' : 'hover:brightness-110 cursor-pointer'
      } ${late ? 'outline outline-2 outline-red-500' : ''}`}
      onClick={!isDragging ? onClick : undefined}
      {...attributes}
      {...listeners}
    >
      {/* Colored header */}
      <div
        className="px-3 py-2"
        style={{ background: stage ? `${stage.color}28` : '#27272a' }}
      >
        <div
          className="text-xs font-bold uppercase tracking-wider mb-1"
          style={{ color: stage?.color ?? '#fff' }}
        >
          {stage?.label}
        </div>
        <div className="text-sm font-semibold text-primary leading-tight">{lead.name}</div>
        <div className="text-xs text-muted mt-0.5">📱 {formatPhone(lead.phone)}</div>
      </div>

      {/* Body */}
      <div className="bg-surface px-3 py-2 flex items-center justify-between border-t border-elevated/50">
        <span className="text-xs text-muted">
          {origin?.icon} {origin?.label}
        </span>
        <span className={`text-xs font-medium ${late ? 'text-red-400' : 'text-muted'}`}>
          {late ? `⚠️ ${days}d` : `${days}d`}
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LeadCard.jsx
git commit -m "feat: add draggable LeadCard with late-alert styling"
```

---

## Task 10: KanbanColumn Component

**Files:**
- Create: `src/components/KanbanColumn.jsx`

- [ ] **Step 1: Create `src/components/KanbanColumn.jsx`**

```jsx
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import LeadCard from './LeadCard'

export default function KanbanColumn({ stage, leads, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px]">
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-t-lg border-b-2"
        style={{
          background: `${stage.color}14`,
          borderColor: stage.color,
        }}
      >
        <span className="text-sm font-semibold text-primary">{stage.label}</span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${stage.color}22`, color: stage.color }}
        >
          {leads.length}
        </span>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 p-2 rounded-b-lg min-h-[120px] transition-colors duration-150 ${
          isOver ? 'bg-elevated' : 'bg-surface'
        }`}
      >
        <SortableContext
          items={leads.map(l => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onCardClick(lead)}
            />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-muted/50">Arraste um lead aqui</span>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/KanbanColumn.jsx
git commit -m "feat: add droppable KanbanColumn with empty state"
```

---

## Task 11: KanbanBoard Component

**Files:**
- Create: `src/components/KanbanBoard.jsx`

- [ ] **Step 1: Create `src/components/KanbanBoard.jsx`**

```jsx
import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import KanbanColumn from './KanbanColumn'
import LeadCard from './LeadCard'
import { STAGES } from '../lib/supabase'
import { useMoveLeadStage } from '../hooks/useLeads'

export default function KanbanBoard({ leads, onCardClick }) {
  const [activeId, setActiveId] = useState(null)
  const { mutate: moveLead } = useMoveLeadStage()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const stageIds = STAGES.map(s => s.id)

  const leadsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = leads.filter(l => l.stage === stage.id)
    return acc
  }, {})

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null

  function handleDragStart({ active }) {
    setActiveId(active.id)
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null)
    if (!over) return

    const lead = leads.find(l => l.id === active.id)
    if (!lead) return

    // over.id is either a column stage ID or another lead's ID
    const targetStage = stageIds.includes(over.id)
      ? over.id
      : leads.find(l => l.id === over.id)?.stage

    if (!targetStage || lead.stage === targetStage) return
    moveLead({ lead, toStage: targetStage })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            leads={leadsByStage[stage.id] ?? []}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150 }}>
        {activeLead ? (
          <div className="rotate-1 shadow-2xl opacity-95">
            <LeadCard lead={activeLead} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/KanbanBoard.jsx
git commit -m "feat: add KanbanBoard with dnd-kit drag-and-drop"
```

---

## Task 12: LeadModal Component

**Files:**
- Create: `src/components/LeadModal.jsx`

- [ ] **Step 1: Create `src/components/LeadModal.jsx`**

```jsx
import { useState } from 'react'
import { ORIGINS } from '../lib/supabase'
import { cleanPhone, formatPhone } from '../lib/utils'
import { useCreateLead } from '../hooks/useLeads'

export default function LeadModal({ onClose }) {
  const [name, setName] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [origin, setOrigin] = useState('anuncio')
  const { mutate: createLead, isPending } = useCreateLead()

  function handlePhoneChange(e) {
    const digits = cleanPhone(e.target.value).slice(0, 11)
    setPhoneDigits(digits)
  }

  function handleSubmit(e) {
    e.preventDefault()
    createLead(
      { name: name.trim(), phone: phoneDigits, origin },
      { onSuccess: onClose }
    )
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-elevated">
          <h2 className="text-base font-semibold text-primary">Novo Lead</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
              Nome *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
              className="w-full bg-bg border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
              WhatsApp *
            </label>
            <input
              type="tel"
              value={formatPhone(phoneDigits)}
              onChange={handlePhoneChange}
              required
              className="w-full bg-bg border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
              Origem *
            </label>
            <select
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              className="w-full bg-bg border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            >
              {ORIGINS.map(o => (
                <option key={o.id} value={o.id}>
                  {o.icon} {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-elevated text-muted text-sm hover:text-primary hover:border-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim() || phoneDigits.length < 10}
              className="flex-1 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Salvando...' : 'Salvar lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LeadModal.jsx
git commit -m "feat: add LeadModal with phone masking and WhatsApp toast"
```

---

## Task 13: LeadPanel Component

**Files:**
- Create: `src/components/LeadPanel.jsx`

- [ ] **Step 1: Create `src/components/LeadPanel.jsx`**

```jsx
import { useState, useRef, useCallback, useEffect } from 'react'
import { STAGES, ORIGINS } from '../lib/supabase'
import { formatPhone, buildWhatsAppUrl, getDaysSince } from '../lib/utils'
import { useMoveLeadStage, useUpdateNotes, useDeleteLead } from '../hooks/useLeads'
import { useLeadHistory } from '../hooks/useLeadHistory'

export default function LeadPanel({ lead, onClose }) {
  const [localNotes, setLocalNotes] = useState(lead.notes ?? '')
  const [moveTarget, setMoveTarget] = useState(lead.stage)
  const timerRef = useRef(null)

  const { data: history = [] } = useLeadHistory(lead.id)
  const { mutate: moveLead, isPending: isMoving } = useMoveLeadStage()
  const { mutate: updateNotes } = useUpdateNotes()
  const { mutate: deleteLead, isPending: isDeleting } = useDeleteLead()

  useEffect(() => {
    setLocalNotes(lead.notes ?? '')
    setMoveTarget(lead.stage)
  }, [lead.id, lead.notes, lead.stage])

  const handleNotesChange = useCallback(
    (e) => {
      const value = e.target.value
      setLocalNotes(value)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        updateNotes({ leadId: lead.id, notes: value })
      }, 1000)
    },
    [lead.id, updateNotes]
  )

  function handleMove() {
    if (moveTarget === lead.stage) return
    moveLead({ lead, toStage: moveTarget })
  }

  function handleDelete() {
    if (!window.confirm(`Excluir o lead "${lead.name}"? Esta ação não pode ser desfeita.`)) return
    deleteLead(lead.id, { onSuccess: onClose })
  }

  const origin = ORIGINS.find(o => o.id === lead.origin)
  const stage = STAGES.find(s => s.id === lead.stage)
  const totalDays = getDaysSince(lead.created_at)

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-elevated flex-shrink-0">
        <div className="min-w-0">
          <h3 className="font-semibold text-primary truncate">{lead.name}</h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: `${stage?.color}20`, color: stage?.color }}
          >
            {stage?.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-muted hover:text-primary text-2xl leading-none ml-3 flex-shrink-0 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* WhatsApp */}
        <a
          href={buildWhatsAppUrl(lead.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-accent-light hover:text-accent transition-colors"
        >
          <span>📱</span>
          <span>{formatPhone(lead.phone)}</span>
          <span className="text-xs">— Abrir WhatsApp →</span>
        </a>

        {/* Info block */}
        <div className="bg-elevated rounded-lg p-3 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted w-16 text-xs">Origem</span>
            <span className="text-primary">{origin?.icon} {origin?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted w-16 text-xs">Entrada</span>
            <span className="text-primary">
              {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted w-16 text-xs">No funil</span>
            <span className="text-primary">{totalDays} dia{totalDays !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Move stage */}
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Mover para etapa
          </p>
          <div className="flex gap-2">
            <select
              value={moveTarget}
              onChange={e => setMoveTarget(e.target.value)}
              className="flex-1 bg-bg border border-elevated rounded-lg px-3 py-2 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            >
              {STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={handleMove}
              disabled={isMoving || moveTarget === lead.stage}
              className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/90 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              {isMoving ? '...' : 'Mover'}
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Anotações
          </p>
          <textarea
            value={localNotes}
            onChange={handleNotesChange}
            rows={4}
            className="w-full bg-bg border border-elevated rounded-lg px-3 py-2.5 text-primary text-sm focus:outline-none focus:border-accent transition-colors resize-none"
            placeholder="Adicione notas sobre este lead..."
          />
        </div>

        {/* History */}
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Histórico
          </p>
          {history.length === 0 ? (
            <p className="text-xs text-muted/60">Sem movimentações ainda.</p>
          ) : (
            <div className="space-y-2">
              {history.map(entry => {
                const fromStage = STAGES.find(s => s.id === entry.from_stage)
                const toStage = STAGES.find(s => s.id === entry.to_stage)
                return (
                  <div key={entry.id} className="flex items-start gap-3 text-xs">
                    <span className="text-muted flex-shrink-0 mt-0.5">
                      {new Date(entry.changed_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-primary">
                      {entry.from_stage
                        ? `${fromStage?.label ?? entry.from_stage} → ${toStage?.label ?? entry.to_stage}`
                        : `Entrada: ${toStage?.label ?? entry.to_stage}`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete */}
      <div className="p-4 border-t border-elevated flex-shrink-0">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full py-2 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/10 disabled:opacity-50 transition-colors"
        >
          {isDeleting ? 'Excluindo...' : 'Excluir lead'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LeadPanel.jsx
git commit -m "feat: add LeadPanel with notes autosave, history, move, and delete"
```

---

## Task 14: LeadTable Component

**Files:**
- Create: `src/components/LeadTable.jsx`

- [ ] **Step 1: Create `src/components/LeadTable.jsx`**

```jsx
import { useState } from 'react'
import { STAGES, ORIGINS } from '../lib/supabase'
import { formatPhone, getDaysSince } from '../lib/utils'

export default function LeadTable({ leads, onRowClick }) {
  const [stageFilter, setStageFilter] = useState([])
  const [originFilter, setOriginFilter] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  function togglePill(arr, setArr, value) {
    setArr(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value])
  }

  function handleSort(col) {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortDir('asc')
    }
  }

  const filtered = leads
    .filter(l => stageFilter.length === 0 || stageFilter.includes(l.stage))
    .filter(l => originFilter.length === 0 || originFilter.includes(l.origin))
    .filter(l => !dateFrom || new Date(l.created_at) >= new Date(dateFrom))
    .filter(l => !dateTo || new Date(l.created_at) <= new Date(`${dateTo}T23:59:59`))
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'pt-BR') * dir
      if (sortBy === 'days') return (getDaysSince(a.created_at) - getDaysSince(b.created_at)) * dir
      if (sortBy === 'updated_at') return (new Date(a.updated_at) - new Date(b.updated_at)) * dir
      return (new Date(a.created_at) - new Date(b.created_at)) * dir
    })

  const sortIcon = col => sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const columns = [
    { key: 'name',       label: 'Nome' },
    { key: 'phone',      label: 'WhatsApp',          sortable: false },
    { key: 'origin',     label: 'Origem',            sortable: false },
    { key: 'stage',      label: 'Etapa',             sortable: false },
    { key: 'days',       label: 'Dias no funil' },
    { key: 'updated_at', label: 'Última atualização' },
  ]

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Filters */}
      <div className="bg-surface rounded-xl p-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Etapa</p>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map(s => (
              <button
                key={s.id}
                onClick={() => togglePill(stageFilter, setStageFilter, s.id)}
                className="text-xs px-3 py-1 rounded-full transition-colors border"
                style={
                  stageFilter.includes(s.id)
                    ? { background: s.color, color: '#fff', borderColor: s.color }
                    : { background: 'transparent', color: '#8888a0', borderColor: '#272a35' }
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Origem</p>
          <div className="flex flex-wrap gap-1.5">
            {ORIGINS.map(o => (
              <button
                key={o.id}
                onClick={() => togglePill(originFilter, setOriginFilter, o.id)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  originFilter.includes(o.id)
                    ? 'bg-accent text-white border-accent'
                    : 'text-muted border-elevated hover:text-primary'
                }`}
              >
                {o.icon} {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Período de entrada
          </p>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-bg border border-elevated rounded-lg px-3 py-1.5 text-primary text-xs focus:outline-none focus:border-accent transition-colors"
            />
            <span className="text-muted text-xs">até</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-bg border border-elevated rounded-lg px-3 py-1.5 text-primary text-xs focus:outline-none focus:border-accent transition-colors"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo('') }}
                className="text-xs text-muted hover:text-primary"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-muted px-1">
        {filtered.length} lead{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <div className="bg-surface rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-elevated">
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                    className={`text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap select-none ${
                      col.sortable !== false ? 'cursor-pointer hover:text-primary' : ''
                    }`}
                  >
                    {col.label}{col.sortable !== false ? sortIcon(col.key) : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => {
                const stage = STAGES.find(s => s.id === lead.stage)
                const origin = ORIGINS.find(o => o.id === lead.origin)
                const days = getDaysSince(lead.created_at)
                return (
                  <tr
                    key={lead.id}
                    onClick={() => onRowClick(lead)}
                    className="border-b border-elevated/40 hover:bg-elevated cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-primary whitespace-nowrap">{lead.name}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{formatPhone(lead.phone)}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{origin?.icon} {origin?.label}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${stage?.color}20`, color: stage?.color }}
                      >
                        {stage?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{days}d</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {new Date(lead.updated_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted text-sm">
              Nenhum lead com os filtros aplicados.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LeadTable.jsx
git commit -m "feat: add LeadTable with multiselect filters, date range, and sortable columns"
```

---

## Task 15: Dashboard Page

**Files:**
- Create: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Create `src/pages/Dashboard.jsx`**

```jsx
import { useState } from 'react'
import Header from '../components/Header'
import KanbanBoard from '../components/KanbanBoard'
import LeadTable from '../components/LeadTable'
import LeadPanel from '../components/LeadPanel'
import LeadModal from '../components/LeadModal'
import { useLeads } from '../hooks/useLeads'

function SkeletonCard() {
  return (
    <div className="rounded-lg overflow-hidden animate-pulse">
      <div className="h-14 bg-elevated" />
      <div className="h-9 bg-surface border-t border-elevated/50" />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="min-w-[280px] max-w-[280px]">
          <div className="h-10 bg-elevated rounded-t-lg mb-0.5 animate-pulse" />
          <div className="bg-surface rounded-b-lg p-2 space-y-2 min-h-[120px]">
            {i < 3 && <SkeletonCard />}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [view, setView] = useState('kanban')
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const { data: leads = [], isLoading } = useLeads()

  const selectedLead = leads.find(l => l.id === selectedLeadId) ?? null

  function handleCardClick(lead) {
    setSelectedLeadId(lead.id)
  }

  function handlePanelClose() {
    setSelectedLeadId(null)
  }

  return (
    <div className="flex flex-col h-screen bg-bg text-primary font-sans overflow-hidden">
      <Header view={view} onViewChange={setView} />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : view === 'kanban' ? (
            <KanbanBoard leads={leads} onCardClick={handleCardClick} />
          ) : (
            <LeadTable leads={leads} onRowClick={handleCardClick} />
          )}
        </div>

        {/* Push side panel */}
        {selectedLead && (
          <div className="w-96 flex-shrink-0 border-l border-elevated overflow-hidden transition-all duration-300">
            <LeadPanel
              key={selectedLead.id}
              lead={selectedLead}
              onClose={handlePanelClose}
            />
          </div>
        )}
      </div>

      {/* FAB — "+ Novo Lead" */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-white shadow-xl flex items-center justify-center text-3xl hover:bg-accent/90 active:scale-95 transition-all z-10"
        title="Novo Lead"
        aria-label="Novo Lead"
      >
        +
      </button>

      {/* New lead modal */}
      {showModal && <LeadModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
```

- [ ] **Step 2: Delete Vite default files**

```bash
rm src/App.css
rm public/vite.svg
rm src/assets/react.svg
```

- [ ] **Step 3: Verify full app in browser**

Run `npm run dev`. Open `http://localhost:5173`:
1. Should redirect to `/login`
2. Register a new studio at `/register`
3. After confirming email (or disabling email confirmation in Supabase Auth settings), log in
4. Dashboard should show kanban with 6 empty columns
5. Click `+` → modal opens → fill in a lead → save
6. Lead appears in "Novo Lead" column
7. Drag lead to "Contato Feito" → toast appears → lead moves
8. Click a card → push panel opens on the right
9. Toggle to Lista → table with filters appears

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: add Dashboard with push panel, FAB, and loading skeleton"
```

---

## Task 16: Config Files and README

**Files:**
- Create: `.env.example`
- Create: `.gitignore` entries
- Create: `README.md`

- [ ] **Step 1: Create `.env.example`**

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

- [ ] **Step 2: Ensure `.gitignore` covers `.env`**

Open `.gitignore` (Vite creates one). Verify it contains `.env` and `.env.local`. If not, add:
```
.env
.env.local
```

- [ ] **Step 3: Create `README.md`**

```markdown
# TattooFlow

CRM para estúdios de tatuagem. Kanban drag-and-drop, painel lateral, histórico de movimentações, anotações com auto-save.

## Stack

- React 18 + Vite + Tailwind CSS
- Supabase (PostgreSQL + Auth + RLS)
- TanStack Query + dnd-kit
- Deploy: Vercel

---

## Setup

### 1. Crie um projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **New Project**
3. Escolha nome, senha do banco e região
4. Aguarde o projeto inicializar (~2 min)

### 2. Rode o schema SQL

1. No painel do Supabase, acesse **SQL Editor**
2. Cole o conteúdo de `supabase/schema.sql`
3. Clique em **Run**
4. Verifique no **Table Editor** que as tabelas `profiles`, `leads` e `lead_history` foram criadas

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Abra `.env` e preencha com os valores do seu projeto Supabase:
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

Registre um novo estúdio em `/register`. Se o Supabase estiver com confirmação de email ativa, desabilite em **Auth → Providers → Email → Confirm email** para facilitar o desenvolvimento local.

### 5. Deploy na Vercel

1. Faça push do projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Na etapa **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Clique em **Deploy**

A Vercel detecta o Vite automaticamente. Build command: `npm run build`. Output: `dist/`.

---

## Desenvolvimento

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm run preview  # preview do build
npm test         # testes unitários (Vitest)
```

## Estrutura

```
src/
├── lib/          # cliente Supabase, constants, utils
├── hooks/        # TanStack Query hooks
├── pages/        # Login, Register, Dashboard
└── components/   # Header, KanbanBoard, LeadCard, LeadPanel, LeadTable...
supabase/
└── schema.sql    # SQL completo para o Supabase
```
```

- [ ] **Step 4: Final test run**

```bash
npm test
```
Expected: all 10 utility tests pass.

- [ ] **Step 5: Final commit**

```bash
git add .env.example README.md .gitignore
git commit -m "feat: add env template and README with setup instructions"
```

---

## Self-Review Checklist

- [x] **Auth flow**: login → dashboard redirect, register → confirmation, logout
- [x] **RLS**: `studio_id = auth.uid()` in policy; INSERT passes `studio_id: session.user.id`
- [x] **Lead creation**: inserts lead + history entry (from_stage: null, to_stage: 'novo')
- [x] **Stage move**: updates stage + inserts history + `updated_at` updated via trigger
- [x] **Late alert**: `isLate` uses `updated_at`, >3 days → red outline + ⚠️ on card
- [x] **Phone**: stored as digits only, displayed formatted, WhatsApp URL via `buildWhatsAppUrl`
- [x] **Auto-save**: debounce 1000ms in `LeadPanel`, toast on success
- [x] **Delete**: `window.confirm` before delete, `onSuccess: onClose` to close panel
- [x] **Mobile kanban**: `overflow-x-auto` + `min-w-[280px]` on columns
- [x] **Push panel**: `w-96 flex-shrink-0` alongside `flex-1` main area
- [x] **Tailwind tokens**: bg, surface, elevated, accent, accent-light, primary, muted used consistently
- [x] **Type consistency**: `STAGES[n].id` matches DB enum values throughout hooks + components
