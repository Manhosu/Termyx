# Etapa 2: Autenticacao e Usuarios

## Objetivo
Implementar sistema completo de autenticacao usando Supabase Auth, incluindo login, signup, recuperacao de senha e onboarding inicial.

---

## Checklist

### 2.1 Configuracao Supabase Auth
- [ ] Habilitar provider Email/Password
- [ ] Configurar templates de email (confirmacao, reset)
- [ ] Definir URL de redirect apos confirmacao
- [ ] Configurar rate limiting

### 2.2 Cliente Supabase
- [ ] Criar cliente browser (`/lib/supabase/client.ts`)
- [ ] Criar cliente server (`/lib/supabase/server.ts`)
- [ ] Criar middleware para proteger rotas

### 2.3 Paginas de Auth
- [ ] Pagina de Login (`/login`)
  - [ ] Form com email e senha
  - [ ] Validacao com Zod
  - [ ] Tratamento de erros
  - [ ] Link para signup
  - [ ] Link para recuperar senha
- [ ] Pagina de Signup (`/signup`)
  - [ ] Form com nome, email, senha
  - [ ] Validacao de senha forte
  - [ ] Termos de uso (checkbox)
  - [ ] Criar perfil na tabela users apos signup
- [ ] Pagina de Reset Password (`/reset-password`)
- [ ] Pagina de Update Password (`/update-password`)

### 2.4 Funcoes de Auth
- [ ] `signUp(email, password, metadata)`
- [ ] `signIn(email, password)`
- [ ] `signOut()`
- [ ] `resetPassword(email)`
- [ ] `updatePassword(newPassword)`
- [ ] `getUser()` - usuario atual
- [ ] `getSession()` - sessao atual

### 2.5 Onboarding
- [ ] Pagina de onboarding (`/onboarding`)
- [ ] Selecao de categoria do negocio:
  - Freelancer/Autonomo
  - Pequena Empresa
  - Agencia/Escritorio
  - Outro
- [ ] Coleta de nome da empresa (opcional)
- [ ] Salvar dados no perfil do usuario

### 2.6 Protecao de Rotas
- [ ] Middleware para verificar autenticacao
- [ ] Redirect para login se nao autenticado
- [ ] Redirect para dashboard se ja autenticado (nas paginas de auth)
- [ ] Redirect para onboarding se perfil incompleto

### 2.7 Hooks e Context
- [ ] `useUser()` - hook para usuario atual
- [ ] `useSession()` - hook para sessao
- [ ] `AuthProvider` - context provider

---

## Implementacao

### Cliente Supabase Browser
```typescript
// /lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Cliente Supabase Server
```typescript
// /lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### Middleware
```typescript
// /middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rotas protegidas
  const protectedRoutes = ['/dashboard', '/templates', '/documents', '/billing', '/admin']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rotas de auth (redirect se ja logado)
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Hook useUser
```typescript
// /lib/hooks/useUser.ts
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

### Trigger para Criar Perfil
```sql
-- Criar perfil automaticamente apos signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## UI Components

### Form de Login
- Input de email com validacao
- Input de senha com toggle mostrar/ocultar
- Botao de submit com loading state
- Mensagens de erro inline
- Links para signup e reset password

### Form de Signup
- Input de nome
- Input de email
- Input de senha com indicador de forca
- Checkbox termos de uso
- Botao de submit

### Onboarding
- Cards para selecao de categoria
- Input opcional para nome da empresa
- Botao continuar
- Skip opcional

---

## Entregaveis
- [ ] Usuario consegue se cadastrar
- [ ] Usuario consegue fazer login
- [ ] Usuario consegue recuperar senha
- [ ] Rotas protegidas funcionando
- [ ] Onboarding completo
- [ ] Perfil criado automaticamente

---

## Proxima Etapa
[Etapa 3: Templates e Documentos](./03-templates-documentos.md)
