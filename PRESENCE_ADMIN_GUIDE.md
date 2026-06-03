# Sistema de Presença em Tempo Real e Painel Administrativo

## 📍 Recursos Implementados

### 1. **Sistema de Presença (Realtime)**
O sistema utiliza **Supabase Realtime Presence** para monitorar quem está online na plataforma em tempo real.

#### Características:
- ✅ Sincronização automática com eventos `sync`, `join` e `leave`
- ✅ Indicador visual "🟢 X Online" na barra lateral (desktop) e navbar (mobile)
- ✅ Sidebar colapsável mostrando avatares e nomes de usuários online
- ✅ Status verde pulsante para usuários conectados

#### Como funciona:
1. Quando um usuário faz login, seu perfil é automaticamente rastreado no canal `online-users`
2. O sistema sincroniza o estado inicial com `sync`
3. Novos usuários são adicionados com evento `join`
4. Usuários que saem são removidos com evento `leave`

### 2. **Painel Administrativo (/admin/users)**
Área restrita para administradores gerenciar usuários da plataforma.

#### Características:
- ✅ Listagem completa de usuários registrados
- ✅ Busca por nome ou ID
- ✅ Estatísticas: Total, Online, Offline
- ✅ Status em tempo real (Online/Offline)
- ✅ Tabela responsiva com informações detalhadas

#### Colunas da tabela:
- Avatar (emoji visual)
- Nome
- Email/ID
- Data de Cadastro
- Pontos (⭐ indicador visual)
- Status (Online/Offline com ponto verde pulsante)

---

## 🚀 Como Usar

### Acessar o Painel Admin

1. **Criar usuário admin** (uma única vez):
   - Use Supabase Auth Console para criar usuário com email: `admin@maissaude.com`
   - O sistema reconhecerá automaticamente este email como administrador

2. **Acessar a área admin**:
   - Faça login com `admin@maissaude.com`
   - Clique no botão "Admin" na barra lateral (esquerda em desktop)
   - Ou acesse diretamente: `https://seu-app.com/admin/users`

### Ver Usuários Online

**Na Navbar/Sidebar**:
- Clique no botão "🟢 X Online" no canto inferior direito
- Abre uma sidebar com lista de usuários conectados
- Veja seus avatares, nomes e emails
- Feche clicando em X

### Recursos da Tabela Admin

**Buscar Usuários**:
- Use o campo de busca para filtrar por nome ou ID
- Busca em tempo real

**Filtrar por Status**:
- Veja quem está Online (ponto verde pulsante)
- Veja quem está Offline (ponto cinza)
- Dados sincronizam automaticamente

---

## 💾 Arquivos Criados

### Contexto de Presença
- `src/context/PresenceContext.tsx` - Gerencia estado de presença com Supabase Realtime

### Componentes
- `src/components/OnlineUsersSidebar.tsx` - Sidebar colapsável com usuários online
- `src/pages/AdminUsers.tsx` - Painel administrativo completo

### Modificações
- `src/App.tsx` - Adicionado PresenceProvider e OnlineUsersSidebar
- `src/components/Layout.tsx` - Adicionado link Admin e indicador online

---

## 🔐 Segurança

### RLS (Row Level Security)
O sistema herda as políticas de RLS existentes do Supabase:
- Apenas usuários autenticados podem ver quem está online
- Admin só acessa `/admin/users` se email == `admin@maissaude.com`
- Dados de perfil são protegidos por RLS

### Proteção de Rota
```typescript
// Admin é verificado em tempo de renderização
if (user?.email !== 'admin@maissaude.com') {
  navigate('/dashboard');
}
```

---

## 🎨 Design & UX

### Navbar Online Indicator
- Cor: Verde (`primary` → `secondary` gradient)
- Animação: Ponto verde pulsante
- Posição: Canto inferior direito (fixed)
- Responsivo: Funciona em mobile e desktop

### Admin Panel
- Layout: Grid 3 colunas para stats
- Cores: Gradiente azul (`primary` → `secondary`)
- Tabela: Responsiva com overflow horizontal em mobile
- Icons: Lucide React para consistência visual

---

## 🧪 Testando

1. **Abra múltiplas abas** do navegador com contas diferentes
2. **Faça login** em cada uma
3. **Veja o contador** aumentar em tempo real
4. **Clique em "X Online"** para ver lista atualizada
5. **Abra Admin Panel** como admin@maissaude.com
6. **Veja status** mudar para Online/Offline em tempo real

---

## 🐛 Troubleshooting

### "Página em branco" no Admin
- Verifique se está logado com admin@maissaude.com
- Limpe cache (Ctrl+Shift+Delete)

### Usuários não aparecem como Online
- Verifique se Supabase Realtime está ativo no projeto
- Confirme que o usuário está autenticado
- Verifique RLS em `profiles` table

### Sidebar não abre
- Verifique se PresenceProvider está em App.tsx
- Confirme que usePresence é importado corretamente

---

## 📱 Compatibilidade

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablet (iPad, Android tablets)
- ✅ Mobile (iOS Safari, Android Chrome)
- ✅ Responsivo com Tailwind CSS

---

## 🔄 Próximos Passos (Opcional)

Para expandir este sistema, considere:
- [ ] Adicionar filtros avançados (por Tribo, Streak, etc)
- [ ] Exportar dados de usuários (CSV)
- [ ] Dashboard com gráficos de engagement
- [ ] Sistema de notificações para admin
- [ ] Histórico de atividades dos usuários
- [ ] Ações em lote (desativar, enviar mensagem, etc)

---

**Desenvolvido com ❤️ para a Plataforma Mais Saúde**
