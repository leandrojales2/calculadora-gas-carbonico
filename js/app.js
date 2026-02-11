/**
 * APP - Application Orchestrator
 * ==============================
 * 
 * Main application controller. Coordinates between UI, Calculator, and CONFIG modules.
 * Handles initialization, form submissions, validation, processing, and error handling.
 * 
 * Initialization sequence:
 * 1. Wait for DOM to be fully loaded
 * 2. Initialize CONFIG module (datalist, autofill behavior)
 * 3. Attach event listeners
 * 4. Set up error handling and logging
 * 
 * Processing flow:
 * 1. User submits form
 * 2. Validate all inputs
 * 3. Show loading state
 * 4. Simulate processing (1500ms)
 * 5. Calculate emissions using Calculator
 * 6. Display results using UI renderers
 * 7. Handle any errors gracefully
 * 
 * @module app
 * @version 1.0.0
 */

const APP = {
  /**
   * Configuration for app behavior.
   * 
   * @type {Object}
   */
  config: {
    processingDelay: 1500, // Simulate API/processing time in ms
    formSelector: CONFIG.selectors.form,
  },

  /**
   * Application state.
   * 
   * @type {Object}
   */
  state: {
    isProcessing: false,
    lastAnalysis: null,
  },

  /**
   * Initializes the application.
   * Called when DOM is fully loaded.
   * 
   * @function init
   * @returns {void}
   */
  init() {
    console.log("[APP] Initializing application...");

    try {
      // Initialize CONFIG module
      this.initializeConfig();

      // Attach event listeners
      this.attachEventListeners();

      // Set up error handling
      this.setupErrorHandling();

      console.log("[APP] ✅ Application initialized successfully");
    } catch (error) {
      console.error("[APP] ❌ Initialization failed:", error);
      UI.showError("Erro ao inicializar a aplicação. Recarregue a página.");
    }
  },

  /**
   * Initializes CONFIG features.
   * - Populates datalist with cities
   * - Sets up distance autofill behavior
   * 
   * @private
   * @function initializeConfig
   * @returns {void}
   */
  initializeConfig() {
    console.log("[APP] Initializing CONFIG module...");

    // Populate datalist with all cities
    CONFIG.populateDatalist();

    // Set up intelligent distance autofill
    CONFIG.setupDistanceAutofill();

    console.log("[APP] CONFIG module initialized");
  },

  /**
   * Attaches event listeners to form and elements.
   * 
   * @private
   * @function attachEventListeners
   * @returns {void}
   */
  attachEventListeners() {
    const form = document.querySelector(this.config.formSelector);

    if (!form) {
      throw new Error("Form element not found");
    }

    // Form submit handler
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.handleFormSubmit();
    });

    console.log("[APP] Event listeners attached");
  },

  /**
   * Sets up global error handling.
   * 
   * @private
   * @function setupErrorHandling
   * @returns {void}
   */
  setupErrorHandling() {
    // Handle uncaught errors
    window.addEventListener("error", (event) => {
      console.error("[APP] Uncaught error:", event.error);
      UI.showError("Um erro inesperado ocorreu. Verifique o console.");
    });

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      console.error("[APP] Unhandled promise rejection:", event.reason);
      UI.showError("Um erro inesperado ocorreu. Tente novamente.");
    });

    console.log("[APP] Error handling configured");
  },

  /**
   * Gets form data from user inputs.
   * 
   * @private
   * @function getFormData
   * @returns {Object} Form data object
   * @throws {Error} If form elements not found
   */
  getFormData() {
    const originInput = document.querySelector(CONFIG.selectors.originInput);
    const destinationInput = document.querySelector(
      CONFIG.selectors.destinationInput
    );
    const distanceInput = document.querySelector(
      CONFIG.selectors.distanceInput
    );
    const transportSelect = document.querySelector(
      'input[name="transport"]:checked'
    );

    if (!originInput || !destinationInput || !distanceInput || !transportSelect) {
      throw new Error("Form elements not found");
    }

    return {
      origin: originInput.value.trim(),
      destination: destinationInput.value.trim(),
      distance: parseFloat(distanceInput.value),
      transportMode: transportSelect.value,
    };
  },

  /**
   * Validates form input data.
   * Checks for empty fields, invalid distances, and unsupported transport modes.
   * 
   * @private
   * @function validateFormData
   * @param {Object} formData - Form data object
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  validateFormData(formData) {
    const errors = [];

    // Validate origin
    if (!formData.origin || formData.origin.length === 0) {
      errors.push("Cidade de origem é obrigatória");
    }

    // Validate destination
    if (!formData.destination || formData.destination.length === 0) {
      errors.push("Cidade de destino é obrigatória");
    }

    // Validate distance
    if (isNaN(formData.distance) || formData.distance === null) {
      errors.push("Distância é obrigatória");
    } else if (formData.distance <= 0) {
      errors.push("Distância deve ser maior que zero");
    } else if (formData.distance > 10000) {
      errors.push("Distância parece muito alta (máx. 10.000 km)");
    }

    // Validate transport mode
    if (!formData.transportMode) {
      errors.push("Modo de transporte é obrigatório");
    }

    if (!Calculator.getSupportedModes().includes(formData.transportMode)) {
      errors.push("Modo de transporte inválido");
    }

    // Validate origin !== destination
    if (
      formData.origin.toLowerCase() ===
      formData.destination.toLowerCase()
    ) {
      errors.push(
        "Origem e destino não podem ser iguais"
      );
    }

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  },

  /**
   * Shows loading/processing state.
   * 
   * @private
   * @function showProcessing
   * @returns {void}
   */
  showProcessing() {
    UI.showLoading(CONFIG.selectors.resultsContent);
    UI.show(CONFIG.selectors.resultsSection);
  },

  /**
   * Hides loading/processing state.
   * 
   * @private
   * @function hideProcessing
   * @returns {void}
   */
  hideProcessing() {
    // Processing state automatically replaced by results
  },

  /**
   * Simulates API/processing delay.
   * In production, this would be replaced with actual API calls.
   * 
   * @private
   * @function simulateProcessing
   * @returns {Promise<void>}
   */
  simulateProcessing() {
    return new Promise((resolve) => {
      setTimeout(resolve, this.config.processingDelay);
    });
  },

  /**
   * Handles form submission.
   * Main orchestrator function that coordinates the entire calculation flow.
   * 
   * Flow:
   * 1. Get form data
   * 2. Validate inputs
   * 3. Show loading state
   * 4. Simulate processing
   * 5. Calculate emissions
   * 6. Render and display results
   * 7. Handle errors
   * 
   * @private
   * @function handleFormSubmit
   * @returns {Promise<void>}
   */
  async handleFormSubmit() {
    console.log("[APP] Form submitted");

    // Prevent multiple submissions while processing
    if (this.state.isProcessing) {
      console.warn("[APP] Request already in progress");
      return;
    }

    try {
      // Get and validate form data
      const formData = this.getFormData();
      console.log("[APP] Form data collected:", formData);

      const validation = this.validateFormData(formData);

      if (!validation.valid) {
        console.warn("[APP] Validation failed:", validation.errors);

        // Display all validation errors
        const errorMessage = validation.errors.join("\n");
        UI.showError(errorMessage);
        return;
      }

      console.log("[APP] ✅ Validation passed");

      // Mark as processing
      this.state.isProcessing = true;

      // Clear previous results
      UI.clearResults();

      // Show loading state
      this.showProcessing();
      console.log("[APP] Processing started...");

      // Simulate processing delay
      await this.simulateProcessing();

      // Calculate emissions using Calculator
      console.log("[APP] Calculating emissions...");
      const analysis = Calculator.analyzeTrip(
        formData.distance,
        formData.transportMode
      );

      console.log("[APP] Analysis completed:", analysis);

      // Save to state
      this.state.lastAnalysis = analysis;

      // Display results
      console.log("[APP] Displaying results...");
      await UI.displayResults(analysis);

      console.log("[APP] ✅ Form processing completed successfully");
    } catch (error) {
      console.error("[APP] ❌ Error during form processing:", error);

      // Show user-friendly error message
      const errorMessage =
        error.message || "Erro ao processar o cálculo. Tente novamente.";
      UI.showError(errorMessage);
    } finally {
      // Always reset processing state
      this.state.isProcessing = false;
      this.hideProcessing();
    }
  },

  /**
   * Gets the last analysis result.
   * Useful for debugging or re-rendering.
   * 
   * @function getLastAnalysis
   * @returns {Object|null} Last analysis object or null
   */
  getLastAnalysis() {
    return this.state.lastAnalysis;
  },

  /**
   * Logs current application state.
   * Useful for debugging.
   * 
   * @function logState
   * @returns {void}
   */
  logState() {
    console.log("[APP] Current state:", this.state);
    console.log("[APP] CONFIG loaded:", typeof CONFIG !== "undefined");
    console.log("[APP] Calculator loaded:", typeof Calculator !== "undefined");
    console.log("[APP] UI loaded:", typeof UI !== "undefined");
    console.log("[APP] RoutesDB loaded:", typeof RoutesDB !== "undefined");
  },
};

/**
 * Initialize application when DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("[APP] DOM Content Loaded - Starting initialization");
  APP.init();
  APP.logState();
});

// Make APP available globally for debugging
if (typeof module !== "undefined" && module.exports) {
  module.exports = APP;
}
