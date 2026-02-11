/**
 * UI - User Interface Rendering & Formatting Layer
 * ================================================
 * 
 * Handles all DOM manipulation, rendering, and visual formatting.
 * Generates HTML template strings for components and provides utilities
 * for show/hide, scrolling, loading states, and number formatting.
 * 
 * This module is strictly responsible for presentation logic only.
 * Calculation logic belongs in Calculator, data in RoutesDB/CONFIG.
 * 
 * @module ui
 * @version 1.0.0
 */

const UI = {
  /**
   * Configuration for visual feedback and animations.
   * 
   * @type {Object}
   */
  config: {
    scrollDuration: 300, // milliseconds
    showHideDuration: 200, // milliseconds
  },

  /**
   * Formats a number as a localized string with thousands separator.
   * 
   * @function formatNumber
   * @param {number} value - Number to format
   * @param {number} [decimals=0] - Decimal places
   * @returns {string} Formatted number string
   * @example
   * UI.formatNumber(51600) // Returns: "51.600"
   * UI.formatNumber(51600.5, 1) // Returns: "51.600,5"
   */
  formatNumber(value, decimals = 0) {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  /**
   * Formats a number as currency (Brazilian Real).
   * 
   * @function formatCurrency
   * @param {number} value - Amount in USD or specified currency
   * @param {string} [currency="USD"] - Currency code
   * @returns {string} Formatted currency string
   * @example
   * UI.formatCurrency(15.50) // Returns: "US$ 15,50"
   */
  formatCurrency(value, currency = "USD") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  },

  /**
   * Formats kilograms with proper unit.
   * 
   * @function formatKg
   * @param {number} kg - Kilograms
   * @returns {string} Formatted kg string
   * @example
   * UI.formatKg(51.6) // Returns: "51,6 kg"
   */
  formatKg(kg) {
    return `${this.formatNumber(kg, 1)} kg`;
  },

  /**
   * Formats grams, converting to kg if >= 1000.
   * 
   * @function formatEmission
   * @param {number} grams - CO₂ in grams
   * @returns {string} Formatted emission string
   * @example
   * UI.formatEmission(51600) // Returns: "51,6 kg CO₂"
   * UI.formatEmission(500) // Returns: "500 g CO₂"
   */
  formatEmission(grams) {
    if (grams >= 1000) {
      return `${this.formatNumber(grams / 1000, 1)} kg CO₂`;
    }
    return `${this.formatNumber(grams, 0)} g CO₂`;
  },

  /**
   * Formats percentage with proper symbol.
   * 
   * @function formatPercentage
   * @param {number} value - Percentage value
   * @returns {string} Formatted percentage
   * @example
   * UI.formatPercentage(58.33) // Returns: "58,33%"
   */
  formatPercentage(value) {
    return `${this.formatNumber(value, 2)}%`;
  },

  /**
   * Formats distance in kilometers.
   * 
   * @function formatDistance
   * @param {number} km - Distance in kilometers
   * @returns {string} Formatted distance
   * @example
   * UI.formatDistance(430) // Returns: "430 km"
   */
  formatDistance(km) {
    return `${this.formatNumber(km, 1)} km`;
  },

  /**
   * Shows an element by removing hidden class and triggering fade-in.
   * 
   * @function show
   * @param {string|HTMLElement} selector - CSS selector or DOM element
   * @param {string} [displayType="block"] - CSS display value
   * @returns {void}
   * @example
   * UI.show("#results")
   * UI.show(element, "flex")
   */
  show(selector, displayType = "block") {
    const element =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

    if (!element) {
      console.warn(`[UI] Element not found: ${selector}`);
      return;
    }

    element.classList.remove("hidden");
    element.style.display = displayType;

    // Trigger fade-in animation
    element.offsetHeight;
    element.classList.add("is-visible");
  },

  /**
   * Hides an element by adding hidden class.
   * 
   * @function hide
   * @param {string|HTMLElement} selector - CSS selector or DOM element
   * @returns {void}
   * @example
   * UI.hide("#results")
   */
  hide(selector) {
    const element =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

    if (!element) {
      console.warn(`[UI] Element not found: ${selector}`);
      return;
    }

    element.classList.remove("is-visible");
    element.classList.add("hidden");
  },

  /**
   * Scrolls smoothly to an element.
   * 
   * @function scrollTo
   * @param {string|HTMLElement} selector - CSS selector or DOM element
   * @param {number} [offset=0] - Offset in pixels
   * @returns {Promise<void>} Resolves when scroll completes
   * @example
   * await UI.scrollTo("#results", 100)
   */
  scrollTo(selector, offset = 0) {
    return new Promise((resolve) => {
      const element =
        typeof selector === "string"
          ? document.querySelector(selector)
          : selector;

      if (!element) {
        console.warn(`[UI] Element not found: ${selector}`);
        resolve();
        return;
      }

      const targetPosition =
        element.getBoundingClientRect().top +
        window.pageYOffset -
        offset;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      setTimeout(resolve, this.config.scrollDuration);
    });
  },

  /**
   * Shows loading spinner on an element.
   * 
   * @function showLoading
   * @param {string|HTMLElement} selector - CSS selector or DOM element
   * @returns {void}
   * @example
   * UI.showLoading("#results-content")
   */
  showLoading(selector) {
    const element =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

    if (!element) return;

    element.innerHTML = `
      <div class="loading" style="text-align: center; padding: 2rem;">
        <div class="spinner" style="display: inline-block; margin-bottom: 1rem;"></div>
        <p style="color: #6b7280; font-size: 0.875rem;">Calculando emissões...</p>
      </div>
    `;
  },

  /**
   * Renders the main results card with emissions data.
   * Returns HTML template string for injection into DOM.
   * 
   * @function renderResults
   * @param {Object} analysis - Analysis object from Calculator.analyzeTrip()
   * @returns {string} HTML template string
   * @example
   * const html = UI.renderResults(analysis)
   * document.querySelector("#results-content").innerHTML = html
   */
  renderResults(analysis) {
    const {
      distance,
      transportMode,
      selectedEmission,
      metadata,
      category,
    } = analysis;

    const emissionKg = selectedEmission / 1000;
    const categoryColor = category.color;

    return `
      <div style="
        background: linear-gradient(135deg, ${categoryColor}12 0%, ${categoryColor}08 100%);
        border: 2px solid ${categoryColor};
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 4px 20px ${categoryColor}20;
      ">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0;">
            ${category.emoji} Resultado da Emissão
          </h2>
          <span style="
            background: ${categoryColor};
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">
            ${category.label}
          </span>
        </div>

        <!-- Info Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <!-- Distance -->
          <div style="
            background: white;
            padding: 1.25rem;
            border-radius: 0.75rem;
            border-left: 4px solid #3b82f6;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          ">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 0.5rem;">Distância</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6;">${distance > 0 ? this.formatDistance(distance) : "—"}</div>
          </div>

          <!-- Transport Mode -->
          <div style="
            background: white;
            padding: 1.25rem;
            border-radius: 0.75rem;
            border-left: 4px solid ${metadata.color};
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          ">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 0.5rem;">Transporte</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: ${metadata.color};">${metadata.emoji} ${metadata.label}</div>
          </div>

          <!-- Main Emission Result -->
          <div style="
            background: linear-gradient(135deg, ${categoryColor}20 0%, ${categoryColor}10 100%);
            padding: 1.25rem;
            border-radius: 0.75rem;
            border-left: 4px solid ${categoryColor};
            grid-column: 1 / -1;
            box-shadow: 0 1px 3px ${categoryColor}15;
          ">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 0.5rem;">Emissão Total de CO₂</div>
            <div style="font-size: 2.25rem; font-weight: 700; color: ${categoryColor}; margin-bottom: 0.25rem;">${this.formatEmission(selectedEmission)}</div>
            <div style="font-size: 0.875rem; color: #6b7280;">${this.formatKg(emissionKg)} equivalentes</div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span style="font-size: 0.875rem; font-weight: 600; color: #6b7280;">Nível de Impacto</span>
            <span style="font-size: 0.75rem; color: #9ca3af;">${Math.round(Math.min((emissionKg / 100) * 100, 100))}%</span>
          </div>
          <div style="
            background: #e5e7eb;
            border-radius: 1rem;
            height: 8px;
            overflow: hidden;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
          ">
            <div 
              style="
                height: 100%;
                background: linear-gradient(90deg, ${categoryColor}, ${categoryColor}dd);
                width: ${Math.min((emissionKg / 100) * 100, 100)}%;
                border-radius: 1rem;
                transition: width 0.5s ease-out;
              "
            ></div>
          </div>
          <div style="
            display: flex;
            justify-content: space-between;
            margin-top: 0.5rem;
            font-size: 0.75rem;
            color: #9ca3af;
            font-weight: 500;
          ">
            <span>0 kg</span>
            <span>30 kg</span>
            <span>60 kg</span>
            <span>90+ kg</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Renders comparison table of all transport modes.
   * Shows relative emissions and savings potential.
   * 
   * @function renderComparison
   * @param {Object} analysis - Analysis object from Calculator.analyzeTrip()
   * @returns {string} HTML template string
   */
  renderComparison(analysis) {
    const { allModes, selectedEmission, distance } = analysis;
    const maxEmission = Math.max(...Object.values(allModes));
    const selectedMode = Object.keys(allModes).find(m => allModes[m] === selectedEmission);

    return `
      <div style="
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      ">
        <!-- Header -->
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 0.5rem 0;">📊 Comparação entre Modos</h3>
          <p style="color: #6b7280; margin: 0; font-size: 0.875rem;">Emissões comparadas para ${this.formatDistance(distance)}</p>
        </div>

        <!-- Modes Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
          ${Object.entries(allModes)
            .map(([mode, emission]) => {
              const metadata = CONFIG.getTransportMetadata(mode);
              const isSelected = mode === selectedMode;
              const percentage = (emission / maxEmission) * 100;
              const savings = maxEmission - emission;
              const savingsPercent = ((savings / maxEmission) * 100).toFixed(1);

              return `
                <div style="
                  background: ${isSelected ? metadata.color + '12' : '#f9fafb'};
                  border: ${isSelected ? '2px solid ' + metadata.color : '2px solid #e5e7eb'};
                  padding: 1.5rem;
                  border-radius: 0.75rem;
                  transition: all 0.3s ease;
                  position: relative;
                  overflow: hidden;
                  box-shadow: ${isSelected ? '0 4px 12px ' + metadata.color + '20' : '0 1px 3px rgba(0,0,0,0.05)'};
                ">
                  ${isSelected ? '<div style="position: absolute; top: 0; right: 0; background: ' + metadata.color + '; color: white; padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 600; border-radius: 0 0 0 0.5rem;">✓ SELECIONADO</div>' : ''}
                  
                  <!-- Mode Header -->
                  <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; margin-top: ${isSelected ? '1rem' : '0'};">
                    <span style="font-size: 2rem;">${metadata.emoji}</span>
                    <h4 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0;">${metadata.label}</h4>
                  </div>

                  <!-- Emission Value -->
                  <div style="
                    background: white;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    margin-bottom: 1rem;
                    border-left: 4px solid ${metadata.color};
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                  ">
                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 0.25rem;">Emissão</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: ${metadata.color};">${this.formatEmission(emission)}</div>
                  </div>

                  <!-- Progress Bar -->
                  <div style="margin-bottom: 1rem;">
                    <div style="
                      background: #e5e7eb;
                      height: 6px;
                      border-radius: 1rem;
                      overflow: hidden;
                      margin-bottom: 0.5rem;
                    ">
                      <div style="
                        height: 100%;
                        background-color: ${metadata.color};
                        width: ${percentage}%;
                        border-radius: 1rem;
                        transition: width 0.5s ease-out;
                      "></div>
                    </div>
                    <div style="font-size: 0.75rem; color: #9ca3af;">${Math.round(percentage)}% do máximo</div>
                  </div>

                  <!-- Comparison Message -->
                  <div style="
                    background: ${mode === 'bicycle' ? '#dbeafe' : '#fef3c7'};
                    color: ${mode === 'bicycle' ? '#0c4a6e' : '#78350f'};
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    text-align: center;
                  ">
                    ${mode === 'bicycle' ? '✨ Zero emissões - Opção mais sustentável!' : `💚 ${savingsPercent}% menor que caminhão`}
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  },

  /**
   * Renders carbon credits and offset information.
   * Shows tree equivalents and market-based offset pricing.
   * 
   * @function renderCarbonCredits
   * @param {Object} analysis - Analysis object from Calculator.analyzeTrip()
   * @returns {string} HTML template string
   */
  renderCarbonCredits(analysis) {
    const { selectedEmission, credits, priceEstimate } = analysis;

    const treeEmoji = "🌱";
    const treeColor = "#10b981";

    return `
      <div style="
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      ">
        <!-- Header -->
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 0.25rem 0;\">🌍 Compensação de Carbono</h3>
          <p style="color: #6b7280; margin: 0; font-size: 0.875rem;\">Saiba quanto você precisa compensar e quanto custaria</p>
        </div>

        <!-- Info Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <!-- Trees Equivalent -->
          <div style="
            background: linear-gradient(135deg, ${treeColor}15 0%, ${treeColor}08 100%);
            border: 2px solid ${treeColor};
            padding: 1.5rem;
            border-radius: 0.75rem;
            text-align: center;
            box-shadow: 0 2px 8px ${treeColor}15;
          ">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;\">🌱</div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 0.5rem;\">Árvores Necessárias</div>
            <div style="font-size: 2rem; font-weight: 700; color: ${treeColor}; margin-bottom: 0.5rem;\">${credits.treesRounded}</div>
            <div style="font-size: 0.875rem; color: #6b7280;\">para compensar em 1 ano</div>
          </div>

          <!-- Carbon Tons -->
          <div style="
            background: linear-gradient(135deg, #3b82f615 0%, #3b82f608 100%);
            border: 2px solid #3b82f6;
            padding: 1.5rem;
            border-radius: 0.75rem;
            text-align: center;
            box-shadow: 0 2px 8px #3b82f615;
          ">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;\">⚖️</div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 0.5rem;\">Toneladas de CO₂</div>
            <div style="font-size: 2rem; font-weight: 700; color: #3b82f6; margin-bottom: 0.5rem;\">${this.formatNumber(credits.carbonTons, 4)}</div>
            <div style="font-size: 0.875rem; color: #6b7280;\">equivalentes</div>
          </div>

          <!-- Offset Price -->
          <div style="
            background: linear-gradient(135deg, #8b5cf615 0%, #8b5cf608 100%);
            border: 2px solid #8b5cf6;
            padding: 1.5rem;
            border-radius: 0.75rem;
            text-align: center;
            box-shadow: 0 2px 8px #8b5cf615;
          ">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;\">💰</div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 0.5rem;\">Custo de Compensação</div>
            <div style="font-size: 2rem; font-weight: 700; color: #8b5cf6; margin-bottom: 0.5rem;\">${this.formatCurrency(priceEstimate.estimatedPrice)}</div>
            <div style="font-size: 0.875rem; color: #6b7280;\">preço de mercado</div>
          </div>
        </div>

        <!-- Divider -->
        <div style="height: 1px; background: #e5e7eb; margin-bottom: 2rem;\"></div>

        <!-- Info Section -->
        <div style="margin-bottom: 2rem;">
          <h4 style="font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0 0 1rem 0;\">ℹ️ Informações Importantes</h4>
          <div style="
            background: #f0fdf4;
            border-left: 4px solid ${treeColor};
            padding: 1rem;
            border-radius: 0.5rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            font-size: 0.875rem;
            color: #166534;
            line-height: 1.6;
          ">
            <div><strong>🌳 Absorção:</strong> Uma árvore absorve aprox. 20 kg de CO₂/ano</div>
            <div><strong>💵 Variação:</strong> Créditos variam de ${this.formatCurrency(10)} a ${this.formatCurrency(25)}/ton</div>
            <div><strong>🌱 Impacto:</strong> Plante árvores locais para máximo benefício</div>
            <div><strong>✓ Certificação:</strong> Projetos VER/VCS são mais confiáveis</div>
          </div>
        </div>

        <!-- Call to Action -->
        <div style="text-align: center;">
          <button style="
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 0.75rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px #10b98120;
            transition: all 0.3s ease;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px #10b98130';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px #10b98120';" onclick="alert('Integração com plataforma de compensação em breve!')">
            🌳 Compensar Emissões Agora
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Clears all result sections.
   * 
   * @function clearResults
   * @returns {void}
   */
  clearResults() {
    document.querySelector(CONFIG.selectors.resultsContent).innerHTML = "";
    document.querySelector(CONFIG.selectors.comparisonContent).innerHTML = "";
    document.querySelector(CONFIG.selectors.carbonCreditsContent).innerHTML =
      "";

    this.hide(CONFIG.selectors.resultsSection);
    this.hide(CONFIG.selectors.comparisonSection);
    this.hide(CONFIG.selectors.carbonCreditsSection);
  },

  /**
   * Displays all results sections with rendered content.
   * 
   * @function displayResults
   * @param {Object} analysis - Analysis object from Calculator.analyzeTrip()
   * @returns {Promise<void>}
   */
  async displayResults(analysis) {
    // Render into content divs
    document.querySelector(CONFIG.selectors.resultsContent).innerHTML =
      this.renderResults(analysis);
    document.querySelector(CONFIG.selectors.comparisonContent).innerHTML =
      this.renderComparison(analysis);
    document.querySelector(CONFIG.selectors.carbonCreditsContent).innerHTML =
      this.renderCarbonCredits(analysis);

    // Show sections with animation
    this.show(CONFIG.selectors.resultsSection);
    this.show(CONFIG.selectors.comparisonSection);
    this.show(CONFIG.selectors.carbonCreditsSection);

    // Scroll to results
    await this.scrollTo(CONFIG.selectors.resultsSection, 100);
  },

  /**
   * Displays error message to user.
   * 
   * @function showError
   * @param {string} message - Error message to display
   * @returns {void}
   */
  showError(message) {
    const html = `
      <div class="error-card" style="
        background-color: #fee2e2;
        border-left: 4px solid #ef4444;
        padding: 1rem;
        border-radius: 0.5rem;
        color: #991b1b;
      ">
        <strong>❌ Erro:</strong> ${message}
      </div>
    `;

    const resultsContent = document.querySelector(
      CONFIG.selectors.resultsContent
    );
    if (resultsContent) {
      resultsContent.innerHTML = html;
      this.show(CONFIG.selectors.resultsSection);
    }
  },

  /**
   * Displays success message.
   * 
   * @function showSuccess
   * @param {string} message - Success message
   * @returns {void}
   */
  showSuccess(message) {
    const html = `
      <div class="success-card" style="
        background-color: #dcfce7;
        border-left: 4px solid #10b981;
        padding: 1rem;
        border-radius: 0.5rem;
        color: #166534;
      ">
        <strong>✅ Sucesso:</strong> ${message}
      </div>
    `;

    console.log(`[UI] Success: ${message}`);
    return html;
  },
};

// Make UI available globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = UI;
}
