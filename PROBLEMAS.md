# Documentação de Problemas Identificados

## Problema #1: Falta de carregamento das variáveis de ambiente na conexão

**Localização**: `src/database/connection.ts:4`

**Categoria**: Tratamento de Erros / Inicialização

**Descrição**: 
O arquivo de conexão tentava acessar `process.env.DATABASE_URL` antes 
do arquivo `.env` ser carregado, resultando em uma string vazia (undefined).

**Por que é um problema**: 
- Node.js não carrega o arquivo `.env` automaticamente
- Sem as credenciais corretas, a Pool de conexão PostgreSQL falha na 
  autenticação imediatamente
- Isso impede que a aplicação inicie ou rode migrations

**Impacto**: 
A aplicação quebrava ao iniciar ou ao tentar rodar migrations, impedindo qualquer uso do sistema.

**Solução aplicada**: 
Adicionada a configuração do dotenv no início para garantir a leitura do .env


## Problema #2: Qualquer usuário pode definir seu próprio papel (role)

**Localização**: `src/validators/user.validator.ts`, `src/routes/user.routes.ts`, `src/controllers/user.controller.ts`, `src/services/user.service.ts`

**Categoria**: Segurança / Controle de Acesso

**Descrição**: 
Os schemas de validação `createUserSchema` e `updateUserSchema` permitiam que qualquer usuário enviasse o campo `role` nas requisições de criação e atualização, possibilitando que um usuário comum se promovesse a administrador.

**Por que é um problema**: 
- Qualquer pessoa criando uma conta poderia se registrar como `admin`
- Usuários comuns poderiam alterar seu próprio `role` para obter privilégios administrativos através do endpoint `PUT /users/:id`

**Impacto**: 
Falha crítica de segurança que permite que qualquer usuário obtenha privilégios administrativos, comprometendo completamente a segurança da aplicação.

**Solução Aplicada (Parcial)**: 

1. **Validator**: Removido o campo `role` dos schemas `createUserSchema` e `updateUserSchema`. Criado novo schema `updateUserRoleSchema` específico para alteração de role.

2. **Rota**: Criada rota exclusiva `PATCH /users/:id/role` para alteração de role.

3. **Controller**: Implementado método `updateUserRole` isolado.

4. **Service**: Implementado método `updateUserRole` com validação de existência do usuário.

**Nota sobre a solução**: 
Novos usuários sempre são criados com role padrão `'user'` (definido no schema do banco de dados). O campo `role` não pode mais ser enviado nos endpoints de criação (`POST /users`) ou atualização genérica (`PUT /users/:id`).

**Limitação**: A rota `PATCH /users/:id/role` está **desprotegida** e não verifica se quem está fazendo a requisição é um administrador. Qualquer pessoa ainda pode acessar este endpoint e alterar roles. Para uma solução completa, seria necessário implementar middlewares de autenticação e autorização na rota.


---

## Problema #3: Criação de usuário aceita e-mails duplicados

**Localização**: `src/services/user.service.ts.28`,

**Categoria**: Validação de Dados / Integridade

**Descrição**: O fluxo de criação de usuário não validava se o e-mail já existia antes de inserir no banco, permitindo múltiplas contas com o mesmo e-mail.

**Por que é um problema**:
- Quebra a unicidade lógica de usuários
- Pode causar conflitos de login e recuperação de senha
- Gera erros de integridade no banco (unique constraint) em produção

**Impacto**: Risco de falhas de autenticação, inconsistência de dados e erros 500 se a constraint de unicidade for disparada.

**Solução aplicada**:
- Antes de criar, a service consulta `findByEmail`; se já existir, lança erro impedindo a criação duplicada.
- O schema do banco já possui constraint `unique` em `email`, mantendo defesa adicional.



---

## Melhorias Adicionais
### Criação de Ferramenta para Testes Rápidos

**Descrição**: 
- Implementação do arquivo `requests.http` na raiz do projeto, contendo cenários de teste pré-configurados para todos os endpoints da API (CRUD de Usuários, Grupos e Produtos).
- Inclusão da seção "🧪 Como Testar" no README, orientando o uso da extensão REST Client para validação imediata.

