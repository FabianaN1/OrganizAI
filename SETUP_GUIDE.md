# GUIA COMPLETO DE TESTES - Sistema Mais Saúde

## 🎯 Problema: Botão "Iniciar minha jornada" não funciona

Se você clicou no botão azul de iniciar jornada e a página congelou ou nada aconteceu, siga este guia para diagnosticar e corrigir.

---

## 🔍 PASSO 1: Verificar o Console do Navegador

### Windows:
1. Abra o DevTools: **F12**
2. Clique na aba **"Console"**
3. Procure por mensagens **vermelhas** ou **amarelas**

### Mac:
1. Abra o DevTools: **Cmd + Option + I**
2. Clique na aba **"Console"**
3. Procure por mensagens **vermelhas** ou **amarelas**

---

## 🧹 PASSO 2: Limpar Cache do Navegador

Se o console está vazio ou sem erros óbvios, o problema pode ser cache corrupto.

### Chrome/Edge (Windows):
```
Ctrl + Shift + Delete
→ Selecione "Todos os arquivos"
→ Clique "Limpar dados"
→ Feche e abra a página novamente
```

### Chrome/Edge (Mac):
```
Cmd + Shift + Delete
→ Selecione "Todos os arquivos"
→ Clique "Limpar dados"
→ Feche e abra a página novamente
```

### Firefox (Windows/Mac):
```
Ctrl/Cmd + Shift + Delete
→ Selecione "Tudo"
→ Clique "Limpar agora"
→ Feche e abra a página novamente
```

---

## 🔐 PASSO 3: Limpar Cookies de Autenticação

Os cookies podem estar corrompidos do Supabase.

1. Abra DevTools: **F12** (ou **Cmd+Option+I** no Mac)
2. Vá em **Application** (Chrome/Edge) ou **Storage** (Firefox)
3. Clique em **Cookies**
4. Procure por cookies que começam com `sb-` ou `supabase`
5. Delete-os todos
6. Feche a aba e abra novamente

---

## 🔄 PASSO 4: Fazer Hard Refresh

Força o navegador a recarregar tudo do servidor.

### Windows:
```
Ctrl + F5
ou
Ctrl + Shift + R
```

### Mac:
```
Cmd + Shift + R
ou
Cmd + Option + R
```

---

## 📱 PASSO 5: Testar em Modo Anônimo

Às vezes extensões do navegador causam conflito.

### Chrome/Edge:
1. Clique nos 3 pontos (canto superior direito)
2. Selecione **"Nova janela anônima"** (Ctrl+Shift+N)
3. Acesse a página e tente novamente

### Firefox:
1. Clique no menu de hambúrguer (≡)
2. Selecione **"Nova janela privada"** (Ctrl+Shift+P)
3. Acesse a página e tente novamente

---

## ✅ PASSO 6: Verificar Conexão com Supabase

Se ainda não funcionar, o Supabase pode estar com problema.

1. Abra DevTools: **F12**
2. Vá em **Network**
3. Recarregue a página (F5)
4. Procure por requisições que começam com `supabase.co`
5. Se vir muitos **400, 403, 500 errors**, Supabase pode estar fora

### Status do Supabase:
- Acesse: https://status.supabase.com
- Verifique se há algum incidente

---

## 🎬 PASSO 7: Fluxo Completo de Teste

Se passou pelos passos anteriores, agora teste o fluxo completo:

### 1️⃣ LANDING PAGE
```
✓ Página carrega com logo e descrição
✓ Vejo 4 seções: Hero, Stats, Features, How It Works
✓ Vejo botão azul "Iniciar minha jornada"
```

### 2️⃣ CLICANDO NO BOTÃO
```
✓ Clico no botão azul
✓ Página vai para /auth?mode=register
✓ Vejo formulário de cadastro
✓ Campos: Nome, Email, Senha
```

### 3️⃣ PREENCHENDO FORMULÁRIO
```
✓ Nome: Digite um nome qualquer
✓ Email: Digite um email (ex: teste@gmail.com)
✓ Senha: Deve atender aos requisitos:
   - Mínimo 8 caracteres
   - Uma letra MAIÚSCULA
   - Uma letra minúscula
   - Um símbolo (!@#$%^&*)
  
Exemplo de senha válida: MinhaS3nh@!
```

### 4️⃣ CLICANDO "REGISTRAR"
```
✓ Botão fica em loading
✓ Página espera carregar
✓ Esperado: vai para /onboarding após 2-3 segundos
✓ Se não aparecer em 10 segundos, abra console (F12)
```

### 5️⃣ PÁGINA ONBOARDING
```
✓ Vejo título: "Escolha seu avatar"
✓ Vejo 8 avatares com emojis
✓ Clico em um avatar
✓ Botão "Próximo" fica habilitado
✓ Clico "Próximo"

✓ Agora: "Defina seu objetivo"
✓ Seleciono "Reduzir" ou "Parar"
✓ Seleciono substância: Álcool, Tabaco ou Ambos
✓ Clico "Próximo"

✓ Agora: "Encontre sua Tribo"
✓ Vejo 5 tribos disponíveis
✓ Clico em uma
✓ Clico "Próximo"

✓ Agora: "Consentimento LGPD"
✓ Leio o texto
✓ Clico na caixa: "Concordo com..."
✓ Botão "Completar onboarding" fica azul
✓ Clico no botão
```

### 6️⃣ DASHBOARD
```
✓ Página carrega com seu nome
✓ Vejo sidebar com navegação
✓ Vejo pontuação: 0 pts
✓ Vejo streak: 0 dias
✓ Vejo botão "🟢 X Online" no canto inferior direito
✓ Navego para "Aprender" - carrega módulos
✓ Navego para "Minha Tribo" - carrega comunidades
```

---

## 🚨 Se Ainda Tiver Problemas

### Erro: "Email já registrado"
```
✓ Use um email diferente
✓ Ou resete a senha desse email
```

### Erro: "Senha fraca"
```
✓ Certifique-se que atende aos requisitos:
   ✓ 8+ caracteres
   ✓ 1 MAIÚSCULA
   ✓ 1 minúscula  
   ✓ 1 símbolo (!@#$%...)
✓ Exemplo: SenhaForte123!
```

### Erro: "Trava na página de onboarding"
```
1. Abra DevTools (F12)
2. Console (aba)
3. Procure por erro em vermelho
4. Copie o erro
5. Faça hard refresh: Ctrl+F5
6. Tente novamente
```

### Erro: "Sidebar não aparece"
```
1. Faça hard refresh: Ctrl+F5
2. Aguarde 3 segundos
3. Procure botão "🟢 Online" no canto inferior direito
4. Se não aparecer, abra console (F12)
```

### Erro: "Presença não funciona"
```
1. Abra 2 abas do navegador
2. Aba 1: Faça login com user1@test.com
3. Aba 2: Faça login com user2@test.com
4. Em ambas, deveria aparecer botão "🟢 2 Online"
5. Se não, recarregue as duas abas
```

---

## 💬 Resumo das Correções Já Feitas

✅ Corrigido: Campo `display_name` → agora usa `full_name`
✅ Corrigido: Duplicatas em tribe_memberships → agora verifica antes de inserir
✅ Corrigido: PresenceContext trava durante onboarding → agora trata corretamente
✅ Corrigido: OnlineUsersSidebar não renderiza → agora defensivo
✅ Corrigido: Layout trava com presença → agora com fallback

---

## 🎯 Checklist Final

- [ ] Limpei cache (Ctrl+Shift+Delete)
- [ ] Limpei cookies de Supabase (DevTools → Application → Cookies)
- [ ] Fiz hard refresh (Ctrl+F5)
- [ ] Testei em modo anônimo/privado
- [ ] Abri DevTools e verifiquei console (F12)
- [ ] Completei o fluxo: Landing → Auth → Onboarding → Dashboard
- [ ] Presença funciona (botão "🟢 Online" aparece)
- [ ] Consigo navegar entre as abas

---

## 📞 Contato com Suporte

Se nada funcionou:

1. Abra DevTools (F12)
2. Console (aba)
3. Copie QUALQUER mensagem de erro (vermelha ou amarela)
4. Descreva:
   - Qual navegador usa (Chrome, Firefox, Safari, Edge)
   - Sistema operacional (Windows, Mac, Linux)
   - Qual email tentou usar
   - Qual senha tentou usar
   - Em que passo travou

---

**Sucesso! A plataforma Mais Saúde agora deve estar 100% funcional! 🎉**
