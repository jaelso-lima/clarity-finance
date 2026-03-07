

# FinanceFlow — SaaS de Gestão Financeira com IA

## 1. Landing Page (Página de Vendas)
- Estrutura AIDA: título impactante, benefícios, prova social, CTAs claros
- Seções: Hero, Funcionalidades, Planos (Free vs PRO R$14,90/mês), FAQ, Footer
- Design moderno com cores suaves (verde/azul financeiro), responsivo
- Botões "Criar conta grátis" e "Assinar PRO"

## 2. Autenticação
- Login, cadastro, recuperação de senha via Supabase Auth
- Perfil do usuário com plano associado (Free por padrão)
- Proteção de rotas autenticadas

## 3. Banco de Dados (Supabase)
- Tabelas: profiles, expenses, income, investments, bills, plans, subscriptions, user_roles, admin_logs
- RLS em todas as tabelas (usuário só vê seus dados)
- Roles: admin e user (tabela separada conforme padrão de segurança)

## 4. Dashboard Financeiro
- Cards: saldo atual, receitas, despesas, lucro/prejuízo do mês
- 4 gráficos interativos (Recharts): despesas por categoria, receitas vs despesas, evolução mensal, investimentos
- Atualização automática ao registrar dados

## 5. Módulo de Despesas
- CRUD completo com campos: valor, categoria, descrição, data, forma de pagamento
- Categorias padrão (alimentação, transporte, etc.) + categorias personalizadas
- Limite de 50 registros no plano Free

## 6. Módulo de Receitas
- CRUD: valor, data, categoria (salário, renda extra, etc.), descrição
- Limite de 50 registros no plano Free

## 7. Contas a Pagar
- CRUD: nome, valor, vencimento, status (pendente/pago)
- Alertas visuais para contas próximas do vencimento
- Botão para marcar como pago

## 8. Controle de Investimentos
- CRUD: tipo (ações, cripto, renda fixa, fundos), valor, lucro/prejuízo, data, descrição
- Gráfico de evolução dos investimentos
- Limite de 10 no plano Free

## 9. Agente Financeiro com IA (Lovable AI)
- Chatbot flutuante (botão no canto inferior)
- Analisa dados do usuário (despesas, receitas, dívidas, investimentos)
- Gera dicas personalizadas em linguagem simples
- Acesso completo apenas no plano PRO (Free: limitado a 2 consultas/mês)

## 10. Sistema de Planos
- Plano Free com limitações definidas
- Plano PRO (R$14,90/mês) com recursos ilimitados
- Página de upgrade com comparação de planos
- Simulação de assinatura (sem cobrança real por enquanto)

## 11. Painel Administrativo
- Rota protegida para admins (validação via tabela user_roles)
- Visualizar/bloquear usuários
- Ativar PRO manualmente para usuários específicos
- Gerenciar planos (criar, editar, ativar/desativar)
- Relatórios: total de usuários, ativos, PRO, receita estimada

## 12. Design e UX
- Interface em português, minimalista, responsiva
- Paleta: tons de verde e azul com fundo claro
- Sidebar de navegação colapsável
- Toda interface pensada para ser agradável e acessível

