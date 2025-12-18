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
```typescript
// Adicionada a configuração do dotenv no início para garantir a leitura do .env
import dotenv from 'dotenv';
dotenv.config();
```