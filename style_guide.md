# 🎨 Garfada — Frontend Styling Guide

Este documento define o **design system base** para o frontend do Garfada.  
O objetivo é garantir **consistência visual, legibilidade e identidade gastronômica**.

---

# 🧱 1. Fundamentos

## 🎯 Princípios
- Priorizar **legibilidade e hierarquia visual**
- Usar cores quentes com moderação (ações, destaque)
- Interface limpa → foco em conteúdo (reviews, restaurantes)
- Consistência entre light e dark mode

---

# 🎨 2. Sistema de Cores

## 🌞 Light Mode

### Base
- `--bg`: #FAFAF9
- `--surface`: #FFFFFF
- `--border`: #E5E7EB

### Texto
- `--text-primary`: #1F2937
- `--text-secondary`: #6B7280

### Cores de Marca
- `--primary`: #F18805
- `--secondary`: #D95D39
- `--accent`: #202C59
- `--highlight`: #F0A202
- `--deep-accent`: #581F18

---

## 🌙 Dark Mode

### Base
- `--bg`: #0B0F1A
- `--surface`: #111827
- `--border`: #1F2937

### Texto
- `--text-primary`: #F9FAFB
- `--text-secondary`: #9CA3AF

### Cores de Marca
- `--primary`: #F18805
- `--secondary`: #F0A202
- `--accent`: #3A4A8A
- `--deep-accent`: #8B3A2F

---

# 🎯 3. Uso das Cores

## Regras importantes
- ❗ Nunca usar cores vibrantes como fundo principal
- ❗ Limitar cores principais a **ações e destaque**
- ❗ Manter contraste mínimo (WCAG AA)

## Aplicação
- Botões primários → `--primary`
- Hover → usar versão mais escura/clara (~10–15%)
- Links → `--accent`
- Destaques (tags, badges) → `--secondary` ou `--highlight`
- Favoritos / interações → `--secondary`
- Elementos premium → `--deep-accent`

---

# 🔤 4. Tipografia

## Fontes
- **Principal (UI):** Inter
- **Principal (Títulos):** Giahfita
- **Principal (Logo):** Giahfita
- **Fallback para títulos/logo:** Poppins

## Instalação da Giahfita
1. Adicionar os arquivos da fonte em `frontend/public/fonts/`:
   - `Giahfita-Regular.woff2`
   - `Giahfita-Regular.woff`
2. Declarar `@font-face` no `frontend/src/index.css`.
3. Usar `Giahfita` como `--font-display` para títulos e identidade de marca.

## Import e Configuração
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap');

@font-face {
  font-family: 'Giahfita';
  src:
    url('/fonts/Giahfita-Regular.woff2') format('woff2'),
    url('/fonts/Giahfita-Regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-display: 'Giahfita', 'Poppins', ui-sans-serif, system-ui, sans-serif;
}
```

## Regras de Uso
- Logo da aplicação deve usar `font-display` (`Giahfita`).
- Títulos (`h1`, `h2`, `h3`, `h4`) devem usar `font-display`.
- Conteúdo corrido e formulários devem usar `font-sans` (`Inter`).
- Garantir licença comercial da fonte Giahfita antes de publicar em produção.

---

# 🧭 5. Padrões de Catálogo

Para páginas de catálogo (ex.: `/catalogo`), usar uma linguagem visual mais editorial sem perder clareza operacional.

## Header do catálogo
- Estrutura recomendada:
  - `eyebrow` curto (categoria/contexto)
  - `h1` forte com descrição objetiva
  - métricas rápidas (filtros ativos, volume de resultados, critério principal)
- Fundo:
  - Pode usar gradiente suave com `color-mix` entre `--surface`, `--accent` e `--primary`
  - Manter contraste alto para textos

## Seletor de filtros
- Deve ser um bloco de decisão, não apenas um formulário.
- Incluir:
  - Título orientado à ação
  - Contador de filtros ativos
  - Ação de limpeza visível (`Limpar filtros`)
  - Resumo dos filtros aplicados em chips
- Inputs e selects:
  - bordas mais evidentes que o container
  - `focus-visible` consistente com cor de navegação (`--accent` ou `--primary`)

## Cards de restaurante
- Hierarquia recomendada:
  1. Foto e sinais rápidos (preço, nota)
  2. Nome e contexto (cozinha/localização)
  3. Descrição curta
  4. Evidências (avaliações, visitas)
  5. Ações (`Salvar`, `Marcar visita`)
- Padrões visuais:
  - Hover com elevação leve (não exagerar blur/sombra)
  - Overlay para legibilidade sobre imagem
  - Tags informativas com contraste AA+

---

# ✅ 6. Qualidade de Experiência

- Priorizar leitura em telas pequenas antes de refinamentos decorativos.
- Toda interação deve manter estados claros:
  - normal
  - hover/focus
  - ativo
  - desabilitado
- Evitar ruído visual:
  - no máximo 1–2 cores de destaque por bloco
  - textos auxiliares sempre em `--text-secondary`
