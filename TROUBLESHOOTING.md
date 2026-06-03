# TROUBLESHOOTING - Sistema Mais Saúde

## Checklist de Funcionamento

### ✅ Fluxo de Cadastro
- [ ] Clique em "Iniciar minha jornada" na landing
- [ ] Página Auth aparece em modo "register"
- [ ] Preencha: Nome, Email, Senha
- [ ] Botão "Registrar" deve estar habilitado
- [ ] Após registro, ir para `/onboarding`

### ✅ Fluxo de Onboarding
- [ ] Página onboarding aparece com 4 passos
- [ ] Escolher avatar (emoji)
- [ ] Inserir "Como quer ser chamado?"
- [ ] Escolher objetivo (reduzir/parar)
- [ ] Escolher substância (álcool/tabaco/ambos)
- [ ] Escolher tribo
- [ ] Marcar "Concordo com LGPD"
- [ ] Clique em "Completar onboarding"
- [ ] Ir para `/dashboard`

### ✅ Painel de Controle
- [ ] Dashboard carrega corretamente
- [ ] Ver pontuação e streak
- [ ] Sidebar lateral funciona
- [ ] Navegar entre abas (Aprender, Tribo, etc)

### ✅ Sistema de Presença
- [ ] Botão "🟢 X Online" aparece (canto inferior direito)
- [ ] Clique abre sidebar com usuários online
- [ ] Múltiplas abas mostram contador aumentando
- [ ] Fechar aba diminui contador

### ✅ Painel Admin
- [ ] Apenas admin@maissaude.com pode acessar
- [ ] /admin/users abre tabela de usuários
- [ ] Busca funciona
- [ ] Status online/offline sincroniza

---

## Possíveis Problemas e Soluções

### 🔴 Problema: Botão "Iniciar jornada" não funciona

**Possíveis Causas:**
1. JavaScript bloqueado no navegador
2. Cache do navegador corrupto
3. Erro de CORS

**Soluções:**
```bash
# Limpar cache
- Ctrl+Shift+Delete (Windows)
- Cmd+Shift+Delete (Mac)

# Hard refresh
- Ctrl+F5 (Windows)
- Cmd+Shift+R (Mac)

# Verificar console
- F12 → Console
- Procure por erros vermelhos
```

---

### 🔴 Problema: Fica na página de onboarding após completar

**Possíveis Causas:**
1. Erro ao salvar avatar no Supabase
2. Erro ao inserir em tribe_memberships
3. Profile não atualizando corretamente

**Soluções:**
```typescript
// Verificar erros no console (F12)
// Procure por "Erro ao completar onboarding"

// Limpar cookies de auth
- Abra DevTools (F12)
- Vá em Application → Cookies
- Delete tudo que começa com "sb-"

// Hard refresh depois
```

---

### 🔴 Problema: Sidebar/Presença não aparece

**Possíveis Causas:**
1. PresenceProvider não está envolvendo app
2. Supabase Realtime desativado
3. Erro no PresenceContext

**Soluções:**
```typescript
// Verificar em Console (F12):
// Procure por qualquer erro de "usePresence"

// Recarregar página
- F5

// Verificar se está autenticado
- Deveria estar em /dashboard, não /auth
```

---

### 🔴 Problema: Admin panel não abre

**Possíveis Causas:**
1. Não está logado com admin@maissaude.com
2. Rota não existe
3. Erro de permissão RLS

**Soluções:**
```bash
# Verifique email em Auth Context
- Console (F12)
- user?.email deve ser "admin@maissaude.com"

# Crie admin user no Supabase
- Console Supabase
- Authentication → Users
- Add user com admin@maissaude.com
- Defina senha temporária
```

---

## Debug no Console (F12)

```javascript
// Verificar usuario autenticado
user

// Verificar profile carregado
profile

// Verificar usuarios online
onlineUsers

// Ver erros
// Procure seção "Console" por mensagens vermelhas
```

---

## Testes de Fluxo Completo

### Teste 1: Cadastro novo usuário
```
1. Nova aba anônima
2. Clique em "Iniciar minha jornada"
3. Preencha: João Silva / joao@test.com / SenhaForte123!
4. Clique "Registrar"
5. Espere carregar onboarding
6. Escolha avatar, objetivo, etc
7. Clique "Completar onboarding"
8. Deveria aparecer Dashboard
```

### Teste 2: Presença em tempo real
```
1. Aba 1: Login user1@test.com
2. Aba 2: Login user2@test.com
3. Aba 1: Botão "🟢 X Online" aumenta? Sim ✓
4. Aba 2: Botão mostra X aumentado? Sim ✓
5. Feche Aba 1
6. Aba 2: Contador diminui? Sim ✓
```

### Teste 3: Admin Panel
```
1. Login como admin@maissaude.com
2. Sidebar deve mostrar link "Admin"
3. Clique em "Admin"
4. Abre /admin/users
5. Tabela mostra todos os usuários? Sim ✓
6. Status online sincroniza? Sim ✓
```

---

## Logs de Erro Comuns

```
ERRO: "display_name column not found"
✓ Corrigido: usar "full_name" em vez de "display_name"

ERRO: "duplicate key value violates unique constraint"
✓ Corrigido: verificar se já existe em tribe_memberships

ERRO: "usePresence must be used within PresenceProvider"
✓ Solução: verificar se PresenceProvider está em App.tsx

ERRO: "Profile is null during onboarding"
✓ Corrigido: PresenceContext agora verifica se profile existe
```

---

## Comando para Reinicar Tudo

```bash
# Limpar node_modules e cache
npm cache clean --force
rm -rf node_modules
npm install

# Recompilar
npm run build

# Testes locais (não rode dev server automaticamente)
# Sistema está pronto para produção
```

---

**Se ainda houver problemas:**
1. Abra DevTools (F12)
2. Vá em Console
3. Procure por mensagens vermelhas
4. Copie o erro completo
5. Descreva os passos que fez antes do erro
