# Fanzine — Landing Page Premium

Landing page monocromática (preto, branco e tons de cinza) para a **Fanzine** — projeto
dedicado a ensinar qualquer pessoa a transformar ideias em publicações independentes. O
produto central é o **Manual Prático de Guerrilha para Criação de Fanzines**, método
desenvolvido ao longo de mais de 20 anos de experimentações. Construída com **HTML5, CSS3 e
JavaScript Vanilla puros** — sem frameworks, sem bundlers, sem etapa de build.

---

## 1. Como executar localmente

A página funciona por abertura direta do arquivo, mas o recomendado é servir por um
servidor local simples.

```bash
# Na raiz do projeto (pasta fanzine-landing)

# Opção 1 — Python 3
python -m http.server 5500

# Opção 2 — Node.js (npx, sem instalar nada)
npx serve . -l 5500
```

Depois abra: <http://localhost:5500>

> Abertura direta: também funciona com duplo clique em `index.html` (o sprite de ícones
> está embutido no HTML justamente para isso). Não há `npm install`, `npm run build`
> nem qualquer compilador envolvido.

---

## 2. Estrutura de pastas

```
/
├── index.html                  # Página única, semântica e com SEO completo
├── css/
│   └── style.css               # Design system + layout + animações + responsividade
├── js/
│   └── script.js               # Todos os comportamentos (Vanilla JS, IIFE)
├── assets/
│   ├── images/                 # Visuais SVG: manual em destaque e 8 itens da galeria
│   │   ├── manual-hero.svg
│   │   └── zine-01.svg … zine-08.svg
│   ├── icons/
│   │   ├── favicon.svg         # Favicon usado no <head>
│   │   └── sprite.svg          # Sprite externo reutilizável (24 ícones)
│   └── logos/
│       ├── fanzine-mark.svg    # Marca compacta (header/footer)
│       └── fanzine-logo.svg    # Logo completo com assinatura
└── README.md
```

---

## 3. Identidade visual

| Token | Valor | Uso |
| --- | --- | --- |
| Fundo principal | `#000000` | `body`, hero |
| Fundo secundário | `#0A0A0A` | Rodapé, fundo de mídias |
| Cards | `#111111` | Cards, painéis, mockups |
| Card elevado | `#161616` | Estado hover |
| Bordas | `#222222` | Contornos padrão |
| Divisórias | `#2A2A2A` | Separações internas |
| Texto principal | `#FFFFFF` | Títulos e destaques |
| Texto secundário | `#BDBDBD` | Corpo de texto |
| Texto de apoio | `#8C8C8C` / `#666666` | Legendas e metadados |

Nenhuma cor vibrante é usada: azul, verde, vermelho, roxo, amarelo e neon estão ausentes,
assim como gradientes coloridos. Os únicos gradientes existentes vão de branco para cinza
ou de transparência (brilhos, traços de gráfico, barra de progresso).

### Liquid Glass (glassmorphism discreto)

Definido pelos tokens `--glass-*` e pela classe utilitária `.glass`, que combina:

- fundo translúcido (`rgba(255,255,255,.045)`);
- `backdrop-filter: blur(16px) saturate(130%)` com prefixo `-webkit-`;
- borda de 1px translúcida;
- reflexo sutil via `::before` com `mask-composite` (linha de luz no canto superior).

Aplicado no header ao rolar, nos cards premium, no painel do menu mobile, nos menus
flutuantes, no modal da galeria, nos botões de vidro e no painel de CTA final.

---

## 4. Seções da página

1. **Header** — logo, navegação em cápsula de vidro, CTAs e menu mobile deslizante.
2. **Hero** — badge, título "Transforme Suas Ideias em um Fanzine Real", CTAs "Quero Meu
   Manual" / "Ver Como Funciona" e painel visual com o manual e cards flutuantes.
3. **Sobre** — história de décadas dedicadas à cultura dos fanzines + pilares (missão, visão, valores).
4. **Benefícios** — grid de 6 cards com ícones SVG.
5. **O que você vai aprender** — grade de 8 módulos numerados (do conceito à produção artesanal).
6. **Diferenciais** — lista de 6 diferenciais + timeline do método.
7. **Números** — contadores animados e barras de indicadores.
8. **Galeria** — masonry com protótipos, pockets, páginas internas, diagramação e trabalhos
   de alunos; filtros por categoria e modal de detalhes.
9. **Depoimentos** — carrossel com autoplay, navegação manual, dots e suporte a swipe.
10. **Comunidade** — "Mostre Seu Trabalho ao Mundo" com CTA "Enviar Meu Fanzine" e passos.
11. **FAQ** — accordion animado (um item aberto por vez).
12. **CTA final** — "Seu Próximo Fanzine Começa Hoje", painel de vidro com captura de e-mail.
13. **Footer** — navegação rápida, links do manual, redes sociais e copyright.

---

## 5. Funcionalidades JavaScript

Todas implementadas em `js/script.js` (IIFE, sem dependências), organizadas por módulos
numerados no topo do arquivo:

| Módulo | Responsabilidade |
| --- | --- |
| `initScrollProgress` | Barra de progresso de leitura no topo da página |
| `initHeaderState` | Estado do header com blur ao rolar |
| `initMobileMenu` | Menu mobile com focus trap, `Esc`, backdrop e bloqueio de scroll |
| `initSmoothScroll` | Rolagem suave com compensação da altura do header |
| `initScrollSpy` | Destaque automático do link da seção visível |
| `initReveal` | Scroll reveal via `IntersectionObserver` com delays por `data-delay` |
| `initCounters` | Contadores crescentes e barras de indicadores animadas |
| `initGalleryFilters` | Filtros da galeria por categoria com reanimação dos cards |
| `initGalleryModal` | Modal acessível com foco gerenciado e conteúdo dinâmico |
| `initCarousel` | Carrossel: autoplay, dots, setas, teclado, swipe e pausa em hover/foco |
| `initFaq` | Accordion com animação de altura (`scrollHeight`) |
| `initLazyLoading` | `loading="lazy"` + `decoding="async"` e fallback para `data-src` |
| `initContactForm` | Validação do e-mail e feedback acessível (`aria-live`) |
| `initBackToTop` | Botão "voltar ao topo" exibido após 640px de rolagem |
| `initCurrentYear` | Ano atual no rodapé |

Acessibilidade: navegação por teclado, `aria-expanded`, `aria-selected`, `aria-current`,
`aria-hidden` nos slides inativos, foco retornando ao elemento de origem e suporte total a
`prefers-reduced-motion` (animações e autoplay desativados).

---

## 6. SEO e performance

- `<title>`, `description`, `keywords`, `author`, `robots` e `canonical`.
- Open Graph e Twitter Card completos.
- Dados estruturados `schema.org` (`Organization` + serviços oferecidos).
- HTML semântico: `header`, `main`, `section`, `article`, `nav`, `footer`, `figure`,
  hierarquia única de `h1` → `h2` → `h3`.
- Imagens SVG (peso mínimo), `loading="lazy"`, `decoding="async"`, `width`/`height`
  declarados para evitar layout shift; visual do hero com `fetchpriority="high"`.
- Animações apenas com `opacity`/`transform` (compostas na GPU, alvo de 60 FPS) e
  listeners de scroll `passive` com throttling via `requestAnimationFrame`.
- Sem bibliotecas de terceiros; apenas a fonte Inter via Google Fonts (com `preconnect`
  e `display=swap`) — a página funciona normalmente com as fontes do sistema se estiver
  offline.

---

## 7. Responsividade testada

| Faixa | Comportamento |
| --- | --- |
| até 420px | Colunas únicas, card flutuante secundário oculto, marca enxuta |
| 421–640px | Menu hamburguer, filtros em scroll horizontal, modal em tela cheia |
| 641–900px | Grids de 1–2 colunas, barras de indicadores empilhadas |
| 901–1024px | Hero em coluna única, modal empilhado (mídia sobre conteúdo) |
| 1025–1599px | Layout completo de desktop |
| 1600px+ | Container expandido para 1440px e respiro extra no hero |

---

## 8. Personalização rápida

- **Cores, raios e sombras:** altere os tokens em `:root` no início de `css/style.css`.
- **Conteúdo:** todo o texto está em `index.html`, em seções comentadas
  (`<!-- ====== SEÇÃO ====== -->`).
- **Novos itens na galeria:** copie um `<article class="zine-card">`, ajuste
  `data-category` (valores usados pelos filtros: `prototipos`, `pocket`, `paginas`,
  `diagramacao`, `alunos`) e os atributos `data-modal-*` do botão interno. Os resultados
  do modal são separados por `|`. O botão usa o padrão *stretched* (`::after` com
  `inset: 0`), então todo o card é clicável sem HTML inválido.
- **Novos ícones:** adicione um `<symbol>` ao sprite inline do `index.html` e, se quiser
  reuso externo, também em `assets/icons/sprite.svg`.

---

## 9. Verificação rápida

```bash
# Sintaxe do JavaScript (requer Node.js — não é build, é apenas validação)
node --check js/script.js
```

Checagens já realizadas neste projeto (após a reescrita completa do conteúdo):

- `node --check js/script.js` → sem erros de sintaxe (`exit 0`);
- todas as 104 âncoras (`href="#..."`) resolvem para ids existentes no documento;
- todas as 16 referências de `assets/**` no HTML existem em disco, incluindo as
  8 imagens usadas pelo modal da galeria;
- os 21 ids consultados pelo JavaScript existem no HTML;
- tags de bloco balanceadas e chaves do CSS balanceadas (420/420);
- palavras proibidas ausentes da paleta (paleta 100% monocromática) e conteúdo
  principal presente (hero, manual, CTAs, sobre, comunidade, CTA final, footer);
- servidor local real (Node `http`) servindo `200` para os 16 arquivos principais
  da página.
