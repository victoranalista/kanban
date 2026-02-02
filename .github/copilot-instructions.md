---
applyTo: '**'
---

O código deve ser seguro, performático, ter UX bonita e consistente e boa legibilidade. Dê o código completo da implementação.

Para ser seguro, além de outras questões, o código deve: autenticar todas as server actions (autenticar e verificar permissões de quem quer acessar), não expor qualquer parte da aplicação sem autenticação, garantir que o proxy está seguro e protegendo toda a aplicação, evitar escrever logs de informações de segurança, inclusive indiretamente (por exemplo, ao logar um objeto que contém essas informações); evitar expor informações de segurança no frontend; evitar persistir (no banco de dados ou em arquivos) informações de segurança sem criptografia ou hashing adequados; evitar uso de chave de criptografia ou hashing que não venha de variável de ambiente.

Exemplos de informações de segurança: credenciais, senhas, tokens, chaves de API, segredos, etc

Para ser performático, além de outras questões, o código deve: evitar consultas desnecessárias ao banco de dados; evitar renderizações desnecessárias no frontend; dar preferência para processamentos do lado do servidor; evitar uso de bibliotecas desnecessárias; retirar do package.json e do código bibliotecas que não estão sendo usadas.

Para ter UX bonita e consistente, além de outras questões, o código deve: usar shadcnui ao máximo; evitar mudanças de estilo do shadcnui; evitar cores ao máximo; manter a consistência com os demais componentes frontend do código já em utilização.

Para ter boa legibilidade, além de outras questões, o código deve: usar server action do react 19 sempre em vez de rotas; usar arrow function sempre. não ter comentários no código; ter funções pequenas (com no máximo 10 linhas dentro do bloco da função) e que receba no máximo 3 parâmetros; não ter linhas em branco dentro de funções; usar nomes significativos para variáveis, funções, módulos, etc; aplicar princípios SOLID (Single Responsibility Principle, Open/Closed Principle, Liskov Substitution Principle, Interface Segregation Principle, Dependency Inversion Principle), DRY (do not repeat yourself), KISS (Keep It Simple, Stupid) e não manter dependências no package.json sem uso no código.

Como agente, nunca execute migrações no banco de dados.

A stack da aplicação é: typescript, vercel, nextjs 16, next auth 5, react 19, neon postgre, prisma, shadcnui e tailwind.

Seja assertivo, crítico e não tenha medo de questionar e criticar o código existente ou outras instruções recebidas. Evite concordar cegamente com o que o usuário pedir ou fizer, a não ser que esteja alinhado com as diretrizes de segurança, performance, UX e legibilidade postas aqui.

faça sempre nessa estrutura de pasta:
app/funcionalidade
/components
/validators (caso necessário)
/actions
/types (caso necessário)
page.tsx (sempre do lado do servidor)