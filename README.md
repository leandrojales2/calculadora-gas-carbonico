# 🌿 Calculadora de Emissão de CO₂

Uma aplicação web moderna e responsiva para calcular emissões de CO₂ em viagens entre cidades brasileiras, desenvolvida com HTML5, CSS3 e JavaScript vanilla.

**Projeto desenvolvido com GitHub Copilot - Lean Jales**

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Etapas do Projeto](#etapas-do-projeto)
- [Arquitetura](#arquitetura)
- [Como Executar](#como-executar)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Correções e Melhorias](#correções-e-melhorias)
- [Tecnologias](#tecnologias)
- [Deploy](#deploy)

---

## 🎯 Visão Geral

A **Calculadora de Emissão de CO₂** permite que usuários calculem o impacto ambiental de suas viagens entre cidades brasileiras, comparando diferentes modos de transporte e visualizando:

- ✅ Emissão total de CO₂ para a rota e modo selecionado
- 📊 Comparação entre 4 modos de transporte (bicicleta, carro, ônibus, caminhão)
- 🌳 Equivalência em árvores necessárias para compensação
- 💰 Custo estimado de créditos de carbono

**URL de Deploy:** [GitHub Pages](https://seu-usuario.github.io/calculadora-gas-carbonico)

---

## 📦 Etapas do Projeto

### **ETAPA 1: Estrutura HTML5 Semântica**

**Objetivo:** Criar uma estrutura HTML5 limpa, semântica e responsiva.

**Componentes:**
- Header com título e subtítulo
- Formulário com inputs inteligentes:
  - Autocomplete de cidades (datalist)
  - Autofill automático de distância
  - Seletor visual de modo de transporte (4 cards com rádios ocultos)
- Seções de resultado (inicialmente ocultas)
- Footer com créditos

**Arquivo:** `index.html`

**Destaques:**
- ✓ Convenção BEM para classes
- ✓ Meta viewport para responsividade
- ✓ Datalist vazia (preenchida por JS)
- ✓ Semântica HTML5 com tags apropriadas

---

### **ETAPA 2: Design System CSS**

**Objetivo:** Criar um design system completo estilo SaaS production-ready.

**Componentes CSS:**

```css
:root {
  --color-primary: #10b981;      /* Verde eco */
  --color-primary-dark: #059669;
  --color-primary-light: #d1fae5;
  /* ... mais tokens */
}
```

**Features:**
- ✓ CSS Custom Properties para colors, spacing, typography, shadows
- ✓ Global reset e base styles
- ✓ Sistema de layout com `.container` e grid
- ✓ Inputs modernos com focus glow
- ✓ Grid responsivo (4 cols desktop, 2 mobile)
- ✓ Spinner com animação
- ✓ Dark mode support
- ✓ Breakpoint responsivo 768px

**Arquivo:** `css/style.css`

---

### **ETAPA 3: API de Rotas Brasileiras**

**Objetivo:** Criar um banco de dados client-side com rotas brasileiras.

**Dados:**
- **40+ rotas reais** conectando capitais e centros regionais
- Incluindo regiões: Sudeste, Centro-Oeste, Sul, Nordeste, Norte

**Exemplo:**
```javascript
{ 
  origin: "São Paulo, SP", 
  destination: "Rio de Janeiro, RJ", 
  distanceKm: 430 
}
```

**Métodos:**
- `getAllCities()` - Retorna lista única e ordenada de cidades
- `findDistance(origin, destination)` - Busca bidirecional

**Arquivo:** `js/routes-data.js`

**Destaques:**
- ✓ Normalização de strings (trim + lowercase)
- ✓ Busca em ambas as direções
- ✓ Dados reais de rotas brasileiras

---

### **ETAPA 4: Módulo de Configuração**

**Objetivo:** Centralizar configuration, fatores de emissão e integração com API.

**Exports:**
```javascript
CONFIG = {
  emissionFactors: { bicycle: 0, car: 120, bus: 50, truck: 80 },
  transportModes: { /* labels, emojis, cores */ },
  carbonCredits: { /* regras de offset */ }
}
```

**Métodos:**
- `populateDatalist()` - Integra com RoutesDB, popula datalist
- `setupDistanceAutofill()` - Autofill inteligente com fallback manual

**Arquivo:** `js/config.js`

**Destaques:**
- ✓ Fatores de emissão realistas
- ✓ Metadados por modo de transporte
- ✓ Autodetecção de rotas
- ✓ Fallback para entrada manual

---

### **ETAPA 5: Motor de Cálculo Puro**

**Objetivo:** Engine de cálculos sem manipulação DOM (pure functions).

**Métodos:**
```javascript
Calculator = {
  calculateEmission(distanceKm, transportMode),
  calculateAllModes(distanceKm),
  calculateSavings(baseline, alternative),
  calculateCarbonCredits(emissionGrams),
  estimateCreditPrice(emissionGrams, pricePerTon),
  analyzeTrip(distanceKm, transportMode) // Tudo junto
}
```

**Arquivo:** `js/calculator.js`

**Destaques:**
- ✓ Zero dependências de DOM
- ✓ Funções puras e testáveis
- ✓ Rounding apropriado
- ✓ Fórmulas comentadas
- ✓ Validação robusta de inputs

---

### **ETAPA 6: Camada de Apresentação (UI)**

**Objetivo:** Renderização de componentes com templates HTML.

**Métodos:**
- `renderResults(analysis)` - Card com resultado da emissão
- `renderComparison(analysis)` - Grid comparativo dos 4 modos
- `renderCarbonCredits(analysis)` - Info cards de compensação

**Features de UI:**
- ✓ Template strings com HTML
- ✓ Formatação número/moeda (pt-BR)
- ✓ Barras de progresso coloridas
- ✓ Badge de categoria (Excelente/Bom/Moderado/Alto)
- ✓ Info cards profissionais
- ✓ Loading spinner
- ✓ Scroll suave para resultados

**Arquivo:** `js/ui.js`

**Destaques:**
- ✓ BEM naming para componentes
- ✓ Cores por modo de transporte
- ✓ Hierarquia visual clara
- ✓ Responsivo com CSS inline
- ✓ Acessibilidade

---

### **ETAPA 7: Orquestrador da Aplicação**

**Objetivo:** Coordenar módulos e gerenciar fluxo da aplicação.

**Fluxo:**
1. **Inicialização** (DOMContentLoaded)
   - Popula datalist
   - Setup autofill
   - Attach event listeners

2. **Submission do Formulário**
   - Validação robusta
   - Show loading state (1500ms simulado)
   - Cálculação com Calculator
   - Renderização com UI
   - Scroll para resultados

3. **Error Handling**
   - Try/catch global
   - Mensagens user-friendly
   - Recovery gracioso

**Arquivo:** `js/app.js`

**Destaques:**
- ✓ Estado da aplicação gerenciado
- ✓ Prevent double-submit
- ✓ Logging detalhado
- ✓ Tratamento de erros

---

## 🏗️ Arquitetura

```
RoutesDB (Data Layer)
        ↓
   CONFIG (Setup + Config)
        ↓
 Calculator (Business Logic - Puro)
        ↓
      UI (Rendering Layer)
        ↓
     APP (Orchestration)
```

**Separação de Responsabilidades:**
- **RoutesDB**: Dados de rotas brasileiras
- **CONFIG**: Configuração, integração com RoutesDB
- **Calculator**: Cálculos (sem DOM)
- **UI**: Renderização e formatação
- **APP**: Fluxo e coordenação

---

## 🚀 Como Executar

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Nenhuma dependência externa ou build process

### Instalação e Uso

#### **Opção 1: Local**
```bash
# Clonar repositório
git clone https://github.com/seu-usuario/calculadora-gas-carbonico.git
cd calculadora-gas-carbonico

# Abrir no navegador (qualquer servidor HTTP)
# Opção A: Python
python -m http.server 8000

# Opção B: Node.js
npx http-server

# Opção C: VS Code (Live Server extension)
# Clique com direito em index.html → Open with Live Server
```

#### **Opção 2: GitHub Pages**
Após configurar GitHub Pages na branch `main`, acesse:
```
https://seu-usuario.github.io/calculadora-gas-carbonico
```

---

## 📁 Estrutura de Pastas

```
calculadora-gas-carbonico/
├── index.html                      # Estrutura HTML semântica
├── css/
│   └── style.css                   # Design system completo
├── js/
│   ├── routes-data.js              # API de rotas brasileiras
│   ├── config.js                   # Configuração e integração
│   ├── calculator.js               # Motor de cálculos puro
│   ├── ui.js                       # Renderização e formatação
│   └── app.js                      # Orquestrador
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages automation
└── README.md                       # Este arquivo
```

---

## ✅ Correções e Melhorias

### Correção 1: Modo Bicicleta
**Problema:** Error `[Calculator] Unknown transport mode: bicycle`

**Causa:** Validação com falsy check (`!0` é true)

**Solução:** Mudança para explicit check
```javascript
// ❌ Antes
if (!CONFIG.getEmissionFactor(transportMode))

// ✅ Depois
if (!(transportMode in CONFIG.emissionFactors))
```

### Correção 2: Autofill de Distância
**Problema:** Distância não atualizava ao selecionar cidades

**Causa:** Eventos `change` e `blur` não disparam ao selecionar do datalist

**Solução:** Adição de evento `input` para detecção em tempo real
```javascript
// Adicionado
originInput.addEventListener("input", attemptAutofill);
```

### Melhoria 1: Presentation dos Resultados
**Antes:** Cards simples com classes BEM básicas

**Depois:** Componentes visuais profissionais com:
- ✨ Gradientes e cores temáticas
- 📊 Barras de progresso animadas
- 🎯 Cards informativos com borders coloridas
- 🏷️ Badges de categoria
- 📈 Progress bar com escala
- ✓ Destaque visual para modo selecionado

### Melhoria 2: Grid de Comparação
**Antes:** Lista linear

**Depois:** Grid 4 colunas (responsive)
- Card individual por modo
- Cores únicas por transporte
- Destaque com elevação e sombra
- Badge "SELECIONADO"
- Mensagens contextuais

### Melhoria 3: Compensação de Carbono
**Antes:** Info boxes em coluna

**Depois:** Layout profissional
- 3 grandes cards com ícones
- Grid responsivo
- Seção de informações colorida
- Botão CTA com hover effect
- Melhor hierarquia visual

### Deploy
**Adição:** GitHub Pages workflow
- ✓ Trigger: push `main` + manual
- ✓ Permissions corretas (OIDC)
- ✓ Automated deployment
- ✓ Parâmetro `enablement: true` para Pages automático

---

## 🛠️ Tecnologias

### Linguagens
- **HTML5** - Estrutura semântica
- **CSS3** - Design system, custom properties, grid, responsive
- **JavaScript (ES6+)** - Vanilla JS, sem frameworks

### Padrões e Convenções
- **BEM** - Block Element Modifier para classes
- **OOCSS** - Object-oriented CSS
- **Responsive Design** - Mobile-first, 768px breakpoint
- **Semantic HTML** - `<header>`, `<main>`, `<section>`, `<footer>`

### Acessibilidade
- ✓ Meta viewport
- ✓ Semantic HTML
- ✓ Contrast colors (WCAG AA)
- ✓ Keyboard navigation
- ✓ Form validation messages

---

## 📊 Funcionalidades Principais

### 1. **Autocomplete de Cidades**
```javascript
// Datalist preenchido com 40+ cidades brasileiras
RoutesDB.getAllCities() → ["Aracaju, SE", "Belém, PA", ...]
```

### 2. **Autofill Automático**
```javascript
// Busca bidirecional de rotas
origin: "São Paulo, SP"
destination: "Rio de Janeiro, RJ"
// → distance: 430 km (auto-filled)
```

### 3. **Cálculo de Emissões**
```javascript
// 4 modos com fatores realistas
bicycle: 0 g/km
car: 120 g/km
bus: 50 g/km
truck: 80 g/km
```

### 4. **Comparação Visual**
```javascript
// Grid 4 colunas com progress bars
// Cálculo de economia vs modo mais poluente
bicycle: 100% economia
car vs truck: 58% economia
```

### 5. **Compensação de Carbono**
```javascript
// Equivalência em árvores
1 tree = 20kg CO₂/ano
emission = 51.6kg → 3 árvores

// Custo em USD (mercado)
Price: $15 USD/ton CO₂
Total: $0.77 USD
```

---

## 🌍 Dados de Rotas

**40 rotas reais cobrindo:**
- ✓ Capitais estaduais
- ✓ Centros regionais
- ✓ Hubs econômicos
- ✓ Todas as regiões do Brasil

**Exemplo de rotas:**
- São Paulo ↔ Rio de Janeiro: 430 km
- São Paulo ↔ Brasília: 1.150 km
- Rio ↔ Belo Horizonte: 450 km
- E muitas mais...

---

## 🔧 Configuração do GitHub Pages

### Passo 1: Settings
```
Repositório → Settings → Pages
```

### Passo 2: Selecione Source
```
Build and deployment
Source: GitHub Actions ✓
```

### Passo 3: Deploy automático
```
Push para main branch → Workflow executa → Deploy automático
Visível em: Actions → Deploy to Github Pages
```

---

## 📱 Responsividade

### Desktop (768px+)
- Grid 4 colunas para modos de transporte
- Layout fluido com 1200px max-width
- Inputs em linha quando espaço permite

### Mobile (<768px)
- Grid 2 colunas para modos
- Stack vertical de elementos
- Touch-friendly buttons
- Padding reduzido

---

## 🐛 Troubleshooting

### "Erro: Distância é obrigatória"
**Solução:** Certifique-se de selecionar cidade completa do datalist (ex: "São Paulo, SP")

### "Not Found - Pages site failed to enable"
**Solução:** 
1. Settings → Pages → Source: "GitHub Actions"
2. Aguarde alguns segundos
3. Faça outro push

### Datalist não aparecer
**Solução:** Abra console (F12) e verifique se `RoutesDB.getAllCities()` retorna array

---

## 📄 Licença

Este projeto foi desenvolvido como parte do curso de GitHub Copilot.

---

## 👤 Autor

**Desenvolvido com GitHub Copilot**
- Instrutor: Leandro Jales
- Plataforma: DIO

---

## 🔗 Links Úteis

- [GitHub Copilot](https://github.com/features/copilot)
- [MDN Web Docs - HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML/)
- [CSS-Tricks - BEM](https://css-tricks.com/bem-101/)
- [GitHub Pages Documentation](https://pages.github.com/)

---

**Última atualização:** 11 de fevereiro de 2026

**Status:** ✅ Completo e em produção

```
🌿 Calculadora de Emissão de CO₂
├── ✅ HTML5 Semântico
├── ✅ CSS Design System
├── ✅ API de Rotas
├── ✅ Configuration Module
├── ✅ Calculator Engine
├── ✅ UI Renderer
├── ✅ App Orchestration
└── ✅ GitHub Pages Deploy
```
