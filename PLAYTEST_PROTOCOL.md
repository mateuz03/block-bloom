# Block Bloom — protocolo de playtest local

## Preparação

1. Gere a build com `pnpm build:playtest`.
2. Sincronize o resultado com `npx cap sync android` e instale no aparelho.
3. Abra **Painel de Teste** na Home e toque em **Iniciar nova sessão**.
4. Entregue o aparelho ao jogador sem explicar as fases.

## Durante o teste

- Não ensine a solução e não toque na tela pelo jogador.
- Não explique a mecânica Bloom antes de ele tentar compreendê-la.
- Não sugira movimentos, saídas ou ordem de peças.
- Observe hesitações, tentativas inválidas, Undo, Restart e abandonos.
- Anote comentários somente depois da fase, sem dados pessoais.

## Perguntas após o teste

- Teve alguma fase confusa?
- Qual fase foi mais difícil?
- Alguma coisa não respondeu como você esperava?
- Você continuaria jogando?

## Encerramento

1. Volte à Home e abra **Painel de Teste**.
2. Exporte o JSON; no Android, use **Copiar JSON** se o download não abrir.
3. Para outro jogador, toque em **Iniciar nova sessão**.
4. Não limpe progresso ou configurações; **Limpar dados** remove somente o playtest local.

Runs interrompidas por fechamento abrupto permanecem como `in-progress`. Apenas sair explicitamente para a Home, trocar de fase ou iniciar uma nova sessão registra abandono.
