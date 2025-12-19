# Documentação de Problemas Identificados

---

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

---

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

**Limitação**: A rota `PATCH /users/:id/role` está **desprotegida** e não verifica se quem está fazendo a requisição é um administrador. Qualquer pessoa ainda pode acessar este endpoint e alterar roles. Para uma solução completa, seria necessário implementar middlewares de autenticação e autorização na rota

---

## Problema #3: Falta de validação de e-mail duplicado (Criação e Atualização)

**Localização**: `src/services/user.service.ts` (métodos `createUser` e `updateUser`)

**Categoria**: Validação de Dados / Integridade

**Descrição**: 
Os fluxos de criação e atualização de usuário não validavam se o e-mail já existia antes de persistir no banco. No caso de atualização, permitia-se alterar o e-mail para um já em uso por outro usuário.

**Por que é um problema**:
- Quebra a unicidade lógica de usuários.
- Pode causar conflitos de login e recuperação de senha.
- Gera erros de integridade no banco (unique constraint), retornando erros 500 genéricos para o cliente.

**Impacto**: 
Risco de falhas de autenticação, inconsistência de dados e má experiência do usuário ao receber erros de servidor em vez de validação.

**Solução aplicada**:
- Implementada verificação `findByEmail` antes de criar (`create`) e antes de atualizar (`update`).
- Se o e-mail já estiver em uso, o serviço agora lança um erro explícito: "Email already in use".

---

## Problema #4: Tentativa de excluir usuário inexistente

**Localização**: `src/services/user.service.ts:69`

**Categoria**: Tratamento de Erros / Lógica de Negócio

**Descrição**: 
A função `deleteUser` tentava executar o comando de exclusão no banco de dados sem verificar antes se o ID do usuário realmente existia.

**Por que é um problema**: 
- Tentar deletar um ID que não existe geralmente não gera erro no banco, apenas retorna que "0 linhas foram afetadas".
- A API retornaria sucesso (Status 200) mesmo sem ter feito nada, enganando o frontend/usuário.

**Impacto**: 
Feedback falso positivo para o cliente da API, causando confusão sobre o estado real dos dados.

**Solução aplicada**: 
Adicionada uma busca (`findById`) antes da operação de delete. Se o usuário não for encontrado, o sistema agora lança um erro explícito de "User not found".

---

## Problema #5: Falta de validação de existência ao vincular Usuário e Grupo

**Localização**: `src/services/user.service.ts:78`

**Categoria**: Integridade de Dados / Tratamento de Erros

**Descrição**: 
O método `addUserToGroup` recebia os IDs de usuário e grupo e tentava criar o relacionamento direto na tabela, sem validar se essas entidades existiam.

**Por que é um problema**: 
- Se o `userId` ou `groupId` não existissem, o banco de dados retornaria um erro de violação de chave estrangeira (Foreign Key Constraint).
- Isso causaria um erro 500 genérico na API, expondo detalhes do banco ou dando uma mensagem pouco útil para quem consome a API.

**Impacto**: 
Má experiência de uso da API e falta de controle sobre a integridade referencial antes de chegar ao banco de dados.

**Solução aplicada**: 
1. Instanciado o `GroupRepository` no serviço.
2. Adicionadas consultas para verificar se o usuário existe (`userRepository.findById`).
3. Adicionadas consultas para verificar se o grupo existe (`groupRepository.findById`).
4. Lança erros específicos ("User not found" ou "Group not found") antes de tentar salvar.

---

## Problema #6: Remoção de usuário de grupo sem verificação de vínculo

**Localização**: `src/repositories/user.repository.ts:76`

**Categoria**: Lógica de Negócio / Tratamento de Erros

**Descrição**: 
O método `removeUserFromGroup` executava o comando de exclusão (`delete`) diretamente no banco de dados sem verificar antes se o usuário realmente fazia parte daquele grupo.

**Por que é um problema**: 
- Se tentarmos remover um usuário de um grupo onde ele não está, o banco de dados não gera erro, apenas informa que "0 linhas foram deletadas".
- A API retornaria status de sucesso (200 OK) para uma operação que, na prática, não fez nada. Isso gera um "falso positivo".

**Impacto**: 
O cliente da API recebe uma confirmação de sucesso enganosa, dificultando o debug e o entendimento do estado real dos dados.

**Solução aplicada**: 
Adicionada uma consulta (`select`) na tabela de relacionamento (`userGroups`) antes de tentar deletar. Se o vínculo não for encontrado, o sistema agora lança um erro explícito: "User is not in this group".

--- 

## Problema #7: Tratamento de erros incorreto (Status 500 Genérico)

**Localização**: `src/controllers/user.controller.ts` (Todos os métodos)

**Categoria**: Tratamento de Erros / Padrões HTTP

**Descrição**: 
O controlador capturava erros de negócio (como "User not found" ou "Email already in use") e retornava invariavelmente o status code `500 Internal Server Error`.

**Por que é um problema**: 
- Viola a semântica do protocolo REST:
  - Recurso não encontrado deve retornar **404**.
  - Conflito de dados (email duplicado) deve retornar **409**.
- O status 500 indica falha crítica no servidor, gerando falsos alertas de monitoramento.

**Impacto**: 
O frontend não conseguia distinguir entre um erro de validação (culpa do usuário) e um erro de servidor (bug), dificultando o tratamento de mensagens na interface.

**Solução aplicada**: 
Refatorado o tratamento de erros (`try/catch`) em todos os métodos do controller para mapear as mensagens de erro:
- `User/Group not found` → **404 Not Found**
- `Email already in use` → **409 Conflict**
- Outros erros → **500 Internal Server Error**

---

## Problema #8: Tipagem insegura no Repositório (Uso de `any`)

**Localização**: `src/repositories/user.repository.ts`

**Categoria**: Type Safety / Boas Práticas

**Descrição**: 
O método de criação no repositório recebia o campo `role` como string opcional e forçava um cast para `any` (`as any`), ignorando a tipagem estrita do TypeScript e os valores permitidos pelo banco de dados.

**Por que é um problema**: 
- O TypeScript perde a capacidade de validar se o valor passado está dentro dos permitidos ('admin', 'user', 'viewer').
- Aumenta o risco de enviar strings inválidas para o banco, o que causaria erros de query em tempo de execução.

**Impacto**: 
Código frágil e propenso a bugs silenciosos que só seriam descobertos ao tentar salvar um papel inválido no banco de dados.

**Solução aplicada**: 
Definida a tipagem estrita para o parâmetro `role` utilizando Union Type (`'admin' | 'user' | 'viewer'`) e removido o uso de `any`, garantindo a segurança de tipos em tempo de compilação.

---


---

## Melhorias Adicionais
### Criação de Ferramenta para Testes Rápidos

**Descrição**: 
- Implementação do arquivo `requests.http` na raiz do projeto, contendo cenários de teste pré-configurados para todos os endpoints da API (CRUD de Usuários, Grupos e Produtos).
- Inclusão da seção "🧪 Como Testar" no README, orientando o uso da extensão REST Client para validação imediata.

