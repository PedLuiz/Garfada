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
- **Títulos:** Poppins

## Import (Google Fonts)
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap');