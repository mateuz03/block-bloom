# Block Bloom

Puzzle 2D mobile-first inspirado em jogos de organização de blocos. Arraste cada peça até a saída da mesma cor, desviando dos outros blocos e tentando concluir cada fase com poucos movimentos.

## Recursos

- Controles por toque e mouse
- Colisão contínua entre blocos
- Fases selecionáveis
- Interface responsiva em orientação vertical
- Aplicativo Android com Capacitor

## Rodando localmente

```bash
pnpm install
pnpm dev
```

Abra `http://127.0.0.1:8080`.

## Build web

```bash
pnpm build:release
```

## Android

Com Java 21, Android SDK e um aparelho autorizado por USB:

```bash
pnpm android:run
```

Veja [PLAY_STORE_RELEASE.md](./PLAY_STORE_RELEASE.md) para os passos de assinatura, geração do Android App Bundle e checklist da Play Store.
