# Documentação de Problemas Identificados

Este arquivo deve ser preenchido pelo candidato com todos os problemas encontrados no código.

## Formato de Documentação

Para cada problema identificado, documente seguindo o formato abaixo:

```markdown
## Problema #X: [Título do Problema]

**Localização**: `caminho/do/arquivo.ts:linha`

**Categoria**: [Segurança / Performance / Lógica de Negócio / Tratamento de Erros / Validação / Integridade]

**Descrição**: 
Descrição detalhada do problema encontrado.

**Por que é um problema**: 
Explicação do porquê este código representa um problema.

**Impacto**: 
Qual o impacto potencial deste problema na aplicação.

**Solução aplicada**: 
Como você corrigiu o problema (após a correção).
```

---

## Exemplo

## Problema #1: Falta de validação de email duplicado

**Localização**: `src/services/user.service.ts:25`

**Categoria**: Validação / Lógica de Negócio

**Descrição**: 
O método `createUser` não verifica se já existe um usuário com o email fornecido antes de criar um novo registro.

**Por que é um problema**: 
Isso pode resultar em emails duplicados no banco de dados, violando a constraint de unicidade e causando erros ou inconsistências.

**Impacto**: 
- Erro ao tentar criar usuário com email duplicado
- Possível inconsistência de dados
- Má experiência do usuário

**Solução aplicada**: 
Adicionada verificação antes de criar o usuário, retornando erro apropriado se o email já existir.

---

## Problemas Identificados

*Preencha abaixo com os problemas que você encontrou...*

