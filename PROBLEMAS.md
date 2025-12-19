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
## Problema #9: Criação de grupos com nomes duplicados

**Localização**: `src/services/group.service.ts` e `src/repositories/group.repository.ts`

**Categoria**: Validação de Dados / Lógica de Negócio

**Descrição**: 
O sistema permitia criar múltiplos grupos com o mesmo nome, pois não havia verificação prévia no banco de dados.

**Por que é um problema**: 
- Gera ambiguidade para os usuários (ex: dois grupos "Financeiro").
- Dificulta a gestão e a seleção correta dos grupos no frontend.

**Impacto**: 
Inconsistência de dados e confusão operacional.

**Solução aplicada**: 
- Criado método `findByName` no repositório.
- Adicionada validação no Service: se o nome já existe, lança erro "Group name already in use".

---

## Problema #10: Exclusão de grupo com produtos associados (Integridade)

**Localização**: `src/services/group.service.ts`

**Categoria**: Integridade de Dados / Segurança

**Descrição**: 
O método `deleteGroup` permitia excluir um grupo mesmo que ele tivesse produtos vinculados, deixando esses produtos com referências órfãs.

**Por que é um problema**: 
- Quebra a integridade referencial do banco de dados.
- Produtos vinculados a grupos inexistentes podem causar erros em listagens ou relatórios.

**Impacto**: 
Corrupção de dados e quebra de funcionalidades que dependem do vínculo grupo-produto.

**Solução aplicada**: 
- Verifica se o grupo existe (`findById`).
- Verifica se existem produtos neste grupo (`productRepository.findByGroup`).
- Se houver produtos, bloqueia a exclusão lançando erro "Cannot delete group with associated products".

---

## Problema #11: Tratamento de erros incorreto no Controller de Grupos

**Localização**: `src/controllers/group.controller.ts`

**Categoria**: Tratamento de Erros / Padrões HTTP

**Descrição**: 
Assim como no controller de usuários, o `GroupController` retornava status 500 para erros de regra de negócio (nome duplicado, grupo não encontrado, bloqueio de exclusão).

**Por que é um problema**: 
- Falta de semântica REST (deveria ser 409 Conflict ou 404 Not Found).
- Frontend não consegue distinguir erro de servidor de erro de validação.

**Solução aplicada**: 
Mapeamento das mensagens de erro nos métodos `create`, `update` e `delete`:
- "Group name already in use" / "Cannot delete group..." → **409 Conflict**
- "Group not found" → **404 Not Found**

---

## Problema #12: Problema de Performance N+1 ao listar usuários do grupo

**Localização**: `src/repositories/group.repository.ts:38`

**Categoria**: Performance

**Descrição**: 
O método `getGroupUsers` realizava uma consulta inicial para buscar os IDs dos usuários do grupo e, em seguida, executava um loop (`for`) fazendo uma nova consulta ao banco de dados para cada usuário encontrado individualmente.

**Por que é um problema**: 
- Isso caracteriza o "N+1 Query Problem".
- Se um grupo tiver 50 usuários, a aplicação faria 51 requisições ao banco de dados para uma única chamada de API.
- Causa latência alta e sobrecarga desnecessária no banco de dados.

**Impacto**: 
Lentidão severa na resposta do endpoint `GET /groups/:id/users` conforme a quantidade de dados cresce, podendo derrubar a aplicação em cenários de alta carga.

**Solução aplicada**: 
Substituído o loop por uma única consulta utilizando `.innerJoin`. Agora o banco de dados resolve a junção das tabelas e retorna todos os dados em apenas uma query.

---
## Problema #13: Vulnerabilidade de SQL Injection na busca de produtos

**Localização**: `src/repositories/product.repository.ts:45`

**Categoria**: Segurança

**Descrição**: 
O método `searchByName` utilizava interpolação de string direta na query SQL (`sql.raw(...)`), concatenando o termo de busca sem higienização.

**Por que é um problema**: 
- Permite que um atacante insira comandos SQL maliciosos através do campo de busca (SQL Injection).
- Um usuário mal intencionado poderia ler dados sensíveis de outras tabelas ou até apagar dados do banco.

**Impacto**: 
Risco crítico de vazamento de dados ou destruição total do banco de dados.

**Solução aplicada**: 
Substituída a query bruta pelo query builder do Drizzle ORM, utilizando parâmetros seguros (`${products.name} ILIKE ...`), o que garante que o input seja tratado como texto e não como comando executável.

---

## Problema #14: Produtos com preços ou estoques negativos

**Localização**: `src/services/product.service.ts` (métodos `create` e `update`)

**Categoria**: Regra de Negócio

**Descrição**: 
O sistema aceitava a criação ou atualização de produtos com valores negativos para `price` e `stock`, o que é fisicamente e financeiramente impossível na lógica da loja.

**Por que é um problema**: 
- Estoque negativo quebra a lógica de inventário.
- Preço negativo poderia gerar créditos indevidos ou erros de cálculo em pedidos futuros.

**Impacto**: 
Inconsistência contábil e de inventário.

**Solução aplicada**: 
Adicionadas validações estritas (`if (data.price < 0)` e `if (data.stock < 0)`) antes de salvar ou atualizar, lançando erros explicativos.

---

## Problema #15: Vínculo de produto com grupo inexistente

**Localização**: `src/services/product.service.ts`

**Categoria**: Integridade de Dados

**Descrição**: 
Ao criar ou editar um produto, era possível enviar um `groupId` inválido. O serviço tentava salvar diretamente, delegando o erro para o banco de dados.

**Por que é um problema**: 
- Gera erros de banco (Foreign Key Constraint) não tratados na camada de aplicação.
- Cria dependência de mensagens de erro do driver do banco, que podem expor detalhes da infraestrutura.

**Impacto**: 
Erro 500 genérico para o usuário em vez de uma mensagem clara de validação.

**Solução aplicada**: 
Adicionada verificação prévia: se `groupId` for informado, o sistema busca o grupo (`groupRepository.findById`). Se não existir, lança erro "Group not found".

---

## Problema #16: Busca de produtos sem termo de pesquisa

**Localização**: `src/controllers/product.controller.ts:58`

**Categoria**: Validação de Entrada

**Descrição**: 
O endpoint de busca não validava se o parâmetro `searchTerm` foi enviado ou se estava vazio, passando `undefined` ou string vazia para o serviço.

**Por que é um problema**: 
- Tentar buscar `undefined` pode quebrar a query ou retornar resultados inesperados (todos os produtos).
- Desperdiça processamento do banco de dados com consultas inúteis.

**Impacto**: 
Comportamento imprevisível da API e desperdício de recursos.

**Solução aplicada**: 
Adicionada validação no controller: se `searchTerm` não for uma string ou estiver vazio (após trim), a API retorna erro `400 Bad Request` informando que o termo é obrigatório.

---

## Problema #17: Exposição de detalhes técnicos de erro em produção

**Localização**: `src/middleware/error.middleware.ts`

**Categoria**: Segurança

**Descrição**: 
O manipulador de erros (`errorHandler`) retornava a mensagem original do erro (`err.message`) para o cliente, independentemente do ambiente.

**Por que é um problema**: 
- Em produção, mensagens de erro cruas podem expor informações sensíveis da infraestrutura (ex: nomes de tabelas do banco, falhas de conexão com IPs, versões de bibliotecas).
- Facilita a exploração de vulnerabilidades por atacantes (Information Disclosure).

**Impacto**: 
Risco de vazamento de informações internas da aplicação.

**Solução aplicada**: 
Adicionada verificação de ambiente (`isProd`). Se estiver em produção, o erro retornado agora é uma mensagem genérica "Internal server error". As mensagens detalhadas ficam restritas ao ambiente de desenvolvimento.

---

## Problema #18: Mensagens de erro de validação genéricas

**Localização**: `src/middleware/validation.middleware.ts`

**Categoria**: Usabilidade / Experiência do Desenvolvedor (DX)

**Descrição**: 
O middleware de validação capturava os erros do Zod e retornava apenas uma mensagem fixa `{ "error": "Validation error" }`, descartando os detalhes sobre quais campos falharam e por quê.

**Por que é um problema**: 
- O frontend ou usuário final não sabe qual campo está incorreto (ex: se o e-mail é inválido ou a senha é curta demais).
- Torna o processo de desenvolvimento e debug muito difícil.
- O código antigo também engolia erros que não eram de validação, retornando 400 incorretamente.

**Impacto**: 
Má experiência do usuário (UX) e dificuldade de integração com o frontend.

**Solução aplicada**: 
- Tratamento específico para instâncias de `ZodError`.
- A resposta agora inclui um array `details` mapeando o caminho (`path`) e a mensagem (`message`) de cada erro de validação.
- Erros que não são de validação agora são passados para o `next(error)` para serem tratados pelo manipulador global.

---

## Problema #19: Listagem de usuários de grupo inexistente

**Localização**: `src/services/group.service.ts:52`

**Categoria**: Lógica de Negócio / Tratamento de Erros

**Descrição**: 
O método `getGroupUsers` buscava os usuários diretamente no repositório sem verificar se o `groupId` informado existia.

**Por que é um problema**: 
- Se o grupo não existe, a API retorna uma lista vazia `[]` com status 200 OK.
- Isso engana o consumidor da API, que pensa que o grupo existe mas não tem usuários, quando na verdade o grupo não existe (deveria ser 404).

**Impacto**: 
Ambiguidade na resposta da API e dificuldade de debug para o frontend.

**Solução aplicada**: 
Adicionada verificação `findById`. Se o grupo não existir, lança erro "Group not found".

---

## Problema #20: Tentativa de excluir produto inexistente

**Localização**: `src/services/product.service.ts:75`

**Categoria**: Tratamento de Erros

**Descrição**: 
O método `deleteProduct` mandava o comando de exclusão para o banco sem verificar se o produto existia.

**Por que é um problema**: 
- Assim como nos outros serviços, o banco não gera erro e a API retorna sucesso (204/200) para um ID que não existe.
- Falta de feedback correto (404) para o cliente.

**Impacto**: 
Feedback falso positivo de exclusão bem-sucedida.

**Solução aplicada**: 
Adicionada verificação `findById` antes de deletar. Se o produto não for encontrado, lança erro "Product not found".

---

## Melhorias Adicionais
### Criação de Ferramenta para Testes Rápidos


**Descrição**: 
- Implementação do arquivo `requests.http` na raiz do projeto, contendo cenários de teste pré-configurados para todos os endpoints da API (CRUD de Usuários, Grupos e Produtos).
- Inclusão da seção "🧪 Como Testar" no README, orientando o uso da extensão REST Client para validação imediata.

