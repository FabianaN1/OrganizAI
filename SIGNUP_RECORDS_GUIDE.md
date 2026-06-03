# 📊 VISUALIZAR REGISTROS DE CADASTRO

Criei uma página completa para você visualizar e gerenciar todos os cadastros realizados na plataforma!

---

## 🎯 Como Acessar

### **Via Sidebar (Desktop)**
1. Faça login com `admin@maissaude.com`
2. Veja a sidebar esquerda
3. Role para baixo até a seção **"Admin"**
4. Clique em **"Registros"** (roxo)
5. Pronto! Abre a página de registros

### **Via URL Direta**
```
https://seu-app.com/admin/registros
```

### **Via Mobile**
1. Faça login com `admin@maissaude.com`
2. Clique no menu de hambúrguer (≡) no topo
3. Role para baixo
4. Clique em **"Registros"**

---

## 📈 O que Você Pode Ver

### **Estatísticas em Tempo Real**
```
┌─────────────────────────────────────────┐
│  Total de Registros: 42                 │
│  Objetivo Reduzir: 28 (66.7%)           │
│  Objetivo Parar: 14 (33.3%)             │
│  Última Jornada: 03/06/2026             │
└─────────────────────────────────────────┘
```

### **Tabela Completa com:**
- ✅ Nome do usuário
- ✅ Email (ID único)
- ✅ Objetivo (Reduzir ou Parar)
- ✅ Substância (Álcool, Tabaco ou Ambos)
- ✅ Data de Cadastro
- ✅ Pontos acumulados ⭐
- ✅ Streak de dias
- ✅ Nível atual

---

## 🔍 Recursos de Filtros

### **Busca Rápida**
```
Campo: "Buscar"
Digite: Nome ou ID do usuário
Resultado: Atualiza em tempo real
```

### **Filtrar por Objetivo**
```
Opções:
- Todos ✓
- Reduzir (quer diminuir consumo)
- Parar (quer parar completamente)
```

### **Filtrar por Substância**
```
Opções:
- Todas ✓
- Álcool 🍷
- Tabaco 🚬
- Ambos 🔄
```

### **Ordenar Resultados**
```
Opções:
- Mais Recentes (padrão)
- Mais Antigos
- Por Nome (A-Z)
- Por Pontos (maior primeiro)
```

### **Limpar Todos os Filtros**
```
Botão: "Limpar Filtros"
Reseta: Busca, Objetivo, Substância, Ordenação
```

---

## 💾 Exportar Dados

### **Exportar para CSV**
1. Aplique os filtros desejados
2. Clique no botão **"Exportar CSV"** (verde)
3. Arquivo baixa automáticamente
4. Nome: `registros_cadastro_YYYY-MM-DD.csv`

### **O que é Incluído no CSV?**
```
Nome, Email (ID), Objetivo, Substância, Data Cadastro, Pontos, Streak, Nível
```

### **Usar em Excel, Google Sheets, etc.**
```
1. Abra o arquivo baixado
2. Importe em: Excel → Arquivo → Abrir
3. Ou: Google Sheets → Arquivo → Importar
4. Ou: Qualquer ferramenta de análise de dados
```

---

## 🎨 Cores e Significados

### **Objetivo**
- 🔵 **Azul (Reduzir)** - Usuário quer reduzir o consumo
- 🟣 **Roxo (Parar)** - Usuário quer parar completamente

### **Substância**
- 🟠 **Laranja (Álcool)** - Foco em bebidas alcoólicas
- 🟡 **Amarelo (Tabaco)** - Foco em cigarros/tabaco
- 🔴 **Vermelho (Ambos)** - Quer reduzir ambas

### **Streak**
- 🕐 **Dias Consecutivos** - Quanto mais, melhor!
- Exemplo: 7 dias = 1 semana sem consumo

---

## 📊 Exemplos de Uso

### **Exemplo 1: Encontrar todos que querem parar**
```
1. Filtro "Objetivo" → Selecione "Parar"
2. Tabela mostra apenas usuários com objetivo "Parar"
3. Total atualiza embaixo
4. Pode exportar esses dados
```

### **Exemplo 2: Usuários com mais pontos**
```
1. Filtro "Ordenar" → Selecione "Por Pontos"
2. Tabela ordena do maior pontuação para menor
3. Veja quem está mais engajado
4. Considere enviar mensagem motivadora
```

### **Exemplo 3: Registros de hoje**
```
1. Busque pela data na coluna "Data Cadastro"
2. Ou use "Mais Recentes" para ver últimos cadastros
3. Quantos se cadastraram hoje?
```

### **Exemplo 4: Extrair dados para relatório**
```
1. Aplique filtros desejados
2. Clique "Exportar CSV"
3. Abra em Excel/Google Sheets
4. Crie gráficos e relatórios
5. Compartilhe com stakeholders
```

---

## 🔐 Permissões

### **Quem Pode Acessar?**
- ✅ `admin@maissaude.com` - Acesso completo
- ❌ Usuários normais - Redirecionados para dashboard

### **Dados Visíveis**
- ✅ Todos os perfis públicos
- ✅ Informações de cadastro
- ✅ Objetivo e substância (não sensível)
- ❌ Senhas (nunca armazenadas)
- ❌ Dados privados de chat

---

## 📈 Interpretando os Dados

### **Streak (Dias de Corda)**
- Números altos = usuários muito engajados
- Números baixos = podem precisar de suporte
- Zero = novo usuário ou resetou

### **Pontos ⭐**
- Ganhos por: check-ins diários, módulos completados, badges
- Mais pontos = mais engajado
- Use para identificar usuários "super"

### **Nível (Lv.)**
- Aumenta conforme acumula pontos
- Lv.1 = Iniciante
- Lv.10+ = Expert/influencer

### **Objetivo**
- Metade "Reduzir", metade "Parar"? = Audiência equilibrada
- Maioria "Parar"? = Usuários com compromisso maior

---

## 🎯 Dicas de Uso

### **Monitorar Crescimento**
1. Acesse regularmente (diário/semanal)
2. Veja quantos novos cadastros
3. Identifique tendências
4. Celebre milestones (100, 500, 1000 usuários)

### **Engajar Usuários**
1. Ordene por Pontos
2. Identifique top performers
3. Envie mensagem motivadora
4. Peça feedback/testimonial

### **Identificar Churn**
1. Ordene por "Mais Antigos"
2. Procure streaks em zero
3. Alcance esses usuários
4. Entenda o que faltou

### **Análise Demográfica**
1. Exporte dados
2. Use Excel para criar gráficos
3. Veja distribuição: objetivo, substância
4. Compartilhe insights com time

---

## 🚀 Recurso: Status em Tempo Real

Além dos registros, você pode acessar:

### **Usuários Online** (`/admin/users`)
- Quem está usando agora?
- Com status online/offline
- Realtime com Supabase
- Link: Sidebar → "Usuários Online" (azul)

### **Registros de Cadastro** (`/admin/registros`)
- Histórico de quem se cadastrou
- Dados completos
- Filtros e export
- Link: Sidebar → "Registros" (roxo)

---

## 📱 Comparação: Online vs. Registros

| Recurso | Usuários Online | Registros |
|---------|-----------------|-----------|
| **Mostra** | Quem está usando AGORA | Todos que se cadastraram |
| **Atualização** | Tempo real (segundos) | Quando entra (1x/cadastro) |
| **Dados** | Nome, Email, Avatar, Status | Nome, Email, Objetivo, Pontos, Streak |
| **Uso** | Monitorar atividade | Análise e relatórios |

---

## ❓ Perguntas Frequentes

**P: Por que alguns nomes aparecem em branco?**
R: Usuário não completou onboarding ou não definiu nome. Clique para ver mais detalhes.

**P: Posso deletar registros?**
R: Não (segurança de dados). Se necessário, contacte suporte técnico.

**P: Quantos registros posso exportar?**
R: Todos! Não há limite. Exporte quantos quiser.

**P: Os dados atualizam automaticamente?**
R: Não. Recarregue a página (F5) para ver novos cadastros.

**P: Posso editar os dados aqui?**
R: Não, essa página é apenas leitura. Edições devem ser feitas via Supabase diretamente.

---

## 🔧 Troubleshooting

**Problema: "Acesso Negado"**
- Verifique se está logado com `admin@maissaude.com`
- Se correto, faça hard refresh: Ctrl+F5

**Problema: "Nenhum registro encontrado"**
- Significa que ninguém se cadastrou ainda
- Ou os filtros estão muito restritivos
- Clique "Limpar Filtros" para resetar

**Problema: "Erro ao carregar registros"**
- Pode ser problema de conexão com Supabase
- Tente: F5 (recarregar)
- Ou verifique status.supabase.com

**Problema: CSV não baixa**
- Verifique se navegador permite downloads
- Tente em modo anônimo
- Tente outro navegador

---

## 🎉 Resumo

Você agora tem uma **dashboard admin completa** para:
- ✅ Ver todos os cadastros
- ✅ Filtrar por objetivo, substância, etc
- ✅ Buscar usuários
- ✅ Exportar dados em CSV
- ✅ Acompanhar crescimento
- ✅ Identificar usuários engajados
- ✅ Tomar decisões baseadas em dados

**Tudo 100% funcional e pronto para usar!** 🚀
