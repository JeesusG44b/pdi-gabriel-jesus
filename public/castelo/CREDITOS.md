# Créditos de arte e áudio do Castelo

Regra (SPEC 9.2): todo pack usado no castelo aparece aqui com autor, link e licença.

## Gothicvania Church Pack

- Autor: Luis Zuno (ansimuz)
- Link: https://ansimuz.itch.io/gothicvania-church-pack
- Licença: Creative Commons Zero (CC0), conforme o `public-license.pdf` que acompanha o pacote baixado em 24/11/2026.
- Arquivos em `public/castelo/arte/`:
  - `tileset.png`: cópia sem alteração de `Assets/ENVIRONMENT/tileset.png`.
  - `janela.png`, `coluna.png`, `altar.png`, `gargula.png`, `tocha-parede.png`: recortes de `Assets/ENVIRONMENT/backgrounds.png`, um painel por arquivo, com a cor de fundo chapada (`#272638`) trocada por transparência e as margens vazias aparadas.
  - `heroi-andando.png`, `heroi-pulando.png`, `heroi-caindo.png`: cópias sem alteração das folhas de sprite do personagem (`Assets/SPRITES/player/`).
- Não usados: música, efeitos sonoros, inimigos, golpes e a pose parada do personagem (é uma pose de luta).

## Desenhado em código

Estandartes, estante de tomos, andaimes e marcadores são desenhados em `src/castelo/pixels.ts`, sem asset externo.
