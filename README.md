# API de Avaliação Técnica

Esta é uma API REST desenvolvida em Node.js com TypeScript, utilizando PostgreSQL como banco de dados e Drizzle ORM. O projeto implementa CRUD completo para Usuários, Grupos e Produtos, com um sistema de permissões e relacionamentos entre entidades.

## 🎯 Objetivo da Avaliação

Este projeto foi desenvolvido para avaliar o nível técnico de candidatos à vaga de **Analista de Desenvolvimento**. O código contém **problemas intencionais** que devem ser identificados, documentados e corrigidos pelos candidatos.

## 📋 Requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

## 🚀 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env` baseado no `.env.example`:
```bash
DATABASE_URL=postgresql://usuario:senha@localhost:5432/ava_tecnica
PORT=3000
JWT_SECRET=seu_secret_aqui
```

4. Crie o banco de dados PostgreSQL:
```sql
CREATE DATABASE ava_tecnica;
```

5. Execute as migrações:
```bash
npm run db:generate
npm run db:migrate
```

6. (Opcional) Popule o banco com dados de teste:
```bash
npm run db:seed
```

7. Inicie o servidor:
```bash
npm run dev
```
## 🧪 Como Testar

Para facilitar a validação dos endpoints e a correção dos bugs, foi incluído o arquivo `requests.http` na raiz do projeto.

Recomenda-se o uso da extensão **REST Client** para VS Code:

1. Instale a extensão "REST Client" (humao.rest-client).
2. Abra o arquivo `requests.http`.
3. Clique no botão **Send Request** (que aparece acima de cada rota) para testar a API diretamente no editor.

## 📚 Estrutura do Projeto

```
src/
├── controllers/     # Controladores das rotas
├── services/        # Lógica de negócio
├── repositories/    # Acesso aos dados
├── routes/          # Definição das rotas
├── validators/      # Validações com Zod
├── middleware/      # Middlewares da aplicação
└── database/        # Configuração do banco e schemas
```

## 🔌 Endpoints da API

### Usuários
- `GET /api/users` - Lista todos os usuários
- `GET /api/users/:id` - Busca usuário por ID
- `POST /api/users` - Cria novo usuário
- `PUT /api/users/:id` - Atualiza usuário
- `DELETE /api/users/:id` - Remove usuário
- `GET /api/users/:id/groups` - Lista grupos do usuário
- `POST /api/users/:id/groups` - Adiciona usuário a grupo
- `DELETE /api/users/:id/groups` - Remove usuário de grupo

### Grupos
- `GET /api/groups` - Lista todos os grupos
- `GET /api/groups/:id` - Busca grupo por ID
- `POST /api/groups` - Cria novo grupo
- `PUT /api/groups/:id` - Atualiza grupo
- `DELETE /api/groups/:id` - Remove grupo
- `GET /api/groups/:id/users` - Lista usuários do grupo

### Produtos
- `GET /api/products` - Lista todos os produtos
- `GET /api/products/:id` - Busca produto por ID
- `POST /api/products` - Cria novo produto
- `PUT /api/products/:id` - Atualiza produto
- `DELETE /api/products/:id` - Remove produto
- `GET /api/products/search?searchTerm=termo` - Busca produtos por nome
- `GET /api/products/group/:groupId` - Lista produtos de um grupo

## ⚠️ Problemas Identificados

Durante a revisão do código, foram identificados **vários problemas** que precisam ser corrigidos. Estes problemas envolvem:

### Categorias de Problemas:

1. **Segurança**
   - Vulnerabilidades de segurança que podem comprometer a aplicação
   - Exposição de informações sensíveis
   - Falta de validação adequada de dados

2. **Performance**
   - Problemas de consultas ao banco de dados
   - Queries ineficientes que podem causar lentidão

3. **Lógica de Negócio**
   - Regras de negócio não implementadas corretamente
   - Validações faltando em operações críticas
   - Comportamentos inesperados em operações de CRUD

4. **Tratamento de Erros**
   - Falta de tratamento adequado de erros
   - Mensagens de erro pouco informativas
   - Códigos de status HTTP incorretos

5. **Validação de Dados**
   - Validações insuficientes ou incorretas
   - Dados inválidos sendo aceitos pela API

6. **Relacionamentos e Integridade**
   - Problemas com relacionamentos entre entidades
   - Falta de verificação de integridade referencial
   - Operações que podem deixar dados inconsistentes

## 📝 Tarefa do Candidato

Sua tarefa é:

1. **Identificar todos os problemas** presentes no código
2. **Documentar cada problema** encontrado, explicando:
   - Onde está localizado (arquivo e linha)
   - Qual é o problema
   - Por que é um problema
   - Qual o impacto potencial

3. **Corrigir os problemas** identificados, implementando as soluções adequadas

4. **Criar um documento** (PROBLEMAS.md) listando todos os problemas encontrados e as correções aplicadas

## 🎓 Critérios de Avaliação

Serão avaliados:

- **Capacidade de identificação**: Quantos problemas você conseguiu identificar?
- **Análise técnica**: Qualidade da explicação sobre cada problema
- **Qualidade das correções**: Se as soluções implementadas são adequadas e seguem boas práticas
- **Organização do código**: Se as correções mantêm ou melhoram a organização do código
- **Documentação**: Clareza e completude da documentação dos problemas

## 📌 Observações Importantes

- Não há limite de problemas a serem encontrados
- Alguns problemas podem estar relacionados entre si
- Preste atenção em detalhes sutis
- Considere casos extremos e edge cases
- Avalie tanto o código quanto a estrutura do projeto

## 🔍 Dicas

- Teste todos os endpoints da API
- Verifique validações de entrada
- Analise consultas ao banco de dados
- Revise tratamento de erros
- Verifique integridade referencial
- Considere questões de segurança
- Avalie performance das operações

## 📄 Licença

Este projeto é apenas para fins de avaliação técnica.

---

**Boa sorte na avaliação!**

