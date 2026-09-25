# Fanzine — Arquivo editorial de cultura independente

Experiência editorial de uma página única sobre **fanzines**, publicações independentes e
produção DIY. O site reúne história, tipos, método de criação, encadernação, movimento,
referências visuais e um convite para publicar.

Construído com **HTML5, CSS3 e JavaScript Vanilla**. Não há framework, bundler, dependências
de runtime ou etapa de build.

## Executar localmente

A pasta pode ser servida com qualquer servidor estático. A opção mais simples, sem instalar
dependências no projeto:

```bash
cd fanzine-landing
python -m http.server 5500
```

Depois abra <http://localhost:5500>.

Também é possível usar `npx serve . -l 5500`. A pasta `imagens/` contém o acervo bruto usado
na curadoria e é ignorada pelo Git; a página em execução usa somente a seleção JPG em
`assets/imagens-fanzine/`.

## Estrutura principal

```text
fanzine-landing/
├── index.html                 # documento semântico, conteúdo e lightbox
├── css/
│   └── style.css              # tokens, layout, responsividade e motion
├── js/
│   └── script.js              # interações vanilla em uma IIFE
├── assets/
│   ├── imagens-fanzine/       # 28 imagens JPG selecionadas e usadas no site
│   ├── icons/                 # favicon e ícones
│   └── logos/                 # marca do Fanzine
├── imagens/                   # acervo local de curadoria (não é carregado em produção)
└── README.md
```

## Narrativa e recursos

A página está organizada como uma revista digital:

1. **Hero e manifesto** — apresentação, CTA e imagens em collage.
2. **O que é um fanzine** — origem, cultura independente, publicações alternativas, DIY e
   importância cultural.
3. **Tipos de fanzine** — cards para os formatos de bolso, artístico, literário, educativo,
   comunitário e experimental.
4. **Como criar o seu** — timeline visual em seis passos: ideia, rascunho, conteúdo,
   diagramação, impressão e distribuição.
5. **Encadernação e produção** — dobras, grampos, costura, encadernação artesanal e impressão
   doméstica, com imagens de referência.
6. **Movimento fanzine** — arte urbana, cultura periférica, produção independente, educação
   cultural e projetos comunitários.
7. **Galeria** — grade editorial com filtros por categoria, imagens lazy e lightbox acessível.
8. **Convite e rodapé** — chamada para começar e canais de contato.

### Interações

- `IntersectionObserver` para scroll reveal, split text discreto e motion blur suave nos reveals de zoom.
- Parallax suave com `requestAnimationFrame`, somente em ponteiro fino.
- Hover com zoom leve, flutuação mínima, transições de cor e estados de foco visíveis.
- Filtros da galeria navegáveis por clique, setas, `Home` e `End`.
- Lightbox com foco gerenciado, `Escape`, bloqueio de scroll e retorno ao card de origem.
- Menu responsivo com `aria-expanded`, `aria-hidden` e fechamento por `Escape`.
- Cursor em forma de ponteiro nativo, sem círculos ou sobreposição visual e com `auto` como
  fallback. Em ponteiro fino, o sistema amostra a cor de fundo sob o ponteiro, compõe
  transparências e troca a cor para manter contraste; a forma permanece pequena e discreta.
- `prefers-reduced-motion` desativa transições e revelações pesadas.

## Identidade visual

A direção combina papel, preto, amarelo, azul e verde em blocos de alto contraste. Tipografia
de display (`Anton`), texto editorial (`Space Grotesk`), monoespaçada (`Special Elite`) e
escrita manual (`Permanent Marker`) criam a combinação entre arquivo, oficina e publicação
independente. Tokens customizáveis estão no início de `css/style.css`.

## Validação rápida

```bash
# Sintaxe do JavaScript
node --check js/script.js

# Servidor local de verificação (opcional)
python -m http.server 5500
```

Também devem ser conferidos:

- todas as âncoras internas apontam para ids existentes;
- as imagens referenciadas em `index.html` existem em `assets/`;
- a galeria filtra e abre/fecha o lightbox;
- o menu mobile abre e fecha;
- não há overflow horizontal em viewports móveis;
- não há erros no console durante a navegação.

A pasta `imagens/` não deve ser publicada como dependência da página: ela foi usada para
selecionar e nomear as imagens professionals que estão em `assets/imagens-fanzine/`.
