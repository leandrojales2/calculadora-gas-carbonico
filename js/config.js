/**
 * CONFIG - Application Configuration & Utilities
 * ==============================================
 * 
 * Centralized configuration module for the CO₂ Emission Calculator.
 * Manages emission factors, transport metadata, carbon credit rules,
 * and provides utility methods for integration with the RoutesDB API
 * and UI components.
 * 
 * @module config
 * @version 1.0.0
 */

const CONFIG = {
  /**
   * Emission factors: CO₂ grams per kilometer for each transport mode.
   * Based on Brazilian transport sector averages.
   * 
   * Sources:
   * - Bicycle: 0 (zero-emission)
   * - Car: ~120g CO₂/km (based on average passenger car)
   * - Bus: ~50g CO₂/km per passenger (shared transport)
   * - Truck: ~80g CO₂/km per ton
   * 
   * @type {Object<string, number>}
   */
  emissionFactors: {
    bicycle: 0,
    car: 120,
    bus: 50,
    truck: 80,
  },

  /**
   * Transport mode metadata: display labels, emojis, and brand colors.
   * Used for UI rendering and visual feedback.
   * 
   * @type {Object<string, Object>}
   * @property {string} label - Portuguese label for the transport mode
   * @property {string} emoji - Unicode emoji representation
   * @property {string} color - CSS color variable or hex value
   */
  transportModes: {
    bicycle: {
      label: "Bicicleta",
      emoji: "🚲",
      color: "#06b6d4", // cyan
    },
    car: {
      label: "Carro",
      emoji: "🚗",
      color: "#a855f7", // purple
    },
    bus: {
      label: "Ônibus",
      emoji: "🚌",
      color: "#f97316", // orange
    },
    truck: {
      label: "Caminhão",
      emoji: "🚚",
      color: "#ec4899", // pink
    },
  },

  /**
   * Carbon credit configuration and offset rules.
   * Defines tree equivalents and offset calculations.
   * 
   * @type {Object}
   * @property {number} coPerTree - CO₂ grams absorbed by one tree per year
   * @property {number} treesMultiplier - Multiplier for display purposes
   * @property {Object} greenCategories - CO₂ threshold tiers and labels
   */
  carbonCredits: {
    // Average tree absorbs ~20kg CO₂/year (20,000g)
    coPerTree: 20000,

    // Multiplier for friendlier numbers
    treesMultiplier: 1,

    // CO₂ threshold categories with labels and colors
    greenCategories: {
      excellent: {
        max: 100,
        label: "Excelente",
        emoji: "🌱",
        color: "#10b981",
      },
      good: {
        max: 300,
        label: "Bom",
        emoji: "🌿",
        color: "#34d399",
      },
      moderate: {
        max: 700,
        label: "Moderado",
        emoji: "🌾",
        color: "#fbbf24",
      },
      high: {
        max: Infinity,
        label: "Alto",
        emoji: "⚠️",
        color: "#f87171",
      },
    },
  },

  /**
   * DOM element selectors and references.
   * Centralized selectors for easy maintenance.
   * 
   * @type {Object}
   */
  selectors: {
    form: "#calculator-form",
    originInput: "#origin",
    destinationInput: "#destination",
    distanceInput: "#distance",
    manualDistanceCheckbox: "#manual-distance",
    citiesList: "#cities-list",
    transportRadios: 'input[name="transport"]',
    resultsSection: "#results",
    resultsContent: "#results-content",
    comparisonSection: "#comparison",
    comparisonContent: "#comparison-content",
    carbonCreditsSection: "#carbon-credits",
    carbonCreditsContent: "#carbon-credits-content",
  },

  /**
   * Populates the datalist with all available cities from RoutesDB.
   * 
   * Retrieves the complete list of cities and creates option elements
   * in the cities-list datalist for autocomplete functionality.
   * 
   * @function populateDatalist
   * @returns {void}
   * @example
   * CONFIG.populateDatalist();
   */
  populateDatalist() {
    const citiesList = document.querySelector(this.selectors.citiesList);

    if (!citiesList) {
      console.warn("[CONFIG] Datalist element not found");
      return;
    }

    // Clear existing options
    citiesList.innerHTML = "";

    // Get all unique cities from RoutesDB
    const cities = RoutesDB.getAllCities();

    // Create and append option elements
    cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      citiesList.appendChild(option);
    });

    console.log(`[CONFIG] Populated datalist with ${cities.length} cities`);
  },

  /**
   * Sets up intelligent distance autofill behavior.
   * 
   * Monitors changes to origin and destination inputs and automatically
   * attempts to fill the distance field using RoutesDB data. Implements
   * smart UI feedback and allows manual entry toggling.
   * 
   * Behavior:
   * - When both origin and destination are filled → search for route
   * - If route found → populate distance, mark readonly, show success
   * - If route not found → keep distance empty, suggest manual entry
   * - Manual checkbox toggles readonly state
   * 
   * @function setupDistanceAutofill
   * @returns {void}
   * @example
   * CONFIG.setupDistanceAutofill();
   */
  setupDistanceAutofill() {
    const originInput = document.querySelector(this.selectors.originInput);
    const destinationInput = document.querySelector(
      this.selectors.destinationInput
    );
    const distanceInput = document.querySelector(this.selectors.distanceInput);
    const manualCheckbox = document.querySelector(
      this.selectors.manualDistanceCheckbox
    );

    if (!originInput || !destinationInput || !distanceInput) {
      console.warn("[CONFIG] Required distance autofill inputs not found");
      return;
    }

    /**
     * Attempts to autofill distance based on current origin/destination.
     * @private
     */
    const attemptAutofill = () => {
      const origin = originInput.value.trim();
      const destination = destinationInput.value.trim();

      // Only autofill if manual mode is disabled
      if (manualCheckbox && manualCheckbox.checked) {
        return;
      }

      // Clear previous feedback
      distanceInput.classList.remove("is-success", "is-warning");

      // Both fields must be filled
      if (!origin || !destination) {
        distanceInput.value = "";
        distanceInput.readOnly = true;
        return;
      }

      // Same origin and destination check
      if (origin.toLowerCase() === destination.toLowerCase()) {
        distanceInput.value = "";
        distanceInput.classList.add("is-warning");
        console.warn("[CONFIG] Origin and destination are the same");
        distanceInput.readOnly = true;
        return;
      }

      // Search for route in RoutesDB
      const distance = RoutesDB.findDistance(origin, destination);

      if (distance !== null) {
        // Route found: populate and lock
        distanceInput.value = distance;
        distanceInput.readOnly = true;
        distanceInput.classList.add("is-success");
        console.log(
          `[CONFIG] Distance autofilled: ${origin} → ${destination} = ${distance}km`
        );
      } else {
        // Route not found: clear and suggest manual entry
        distanceInput.value = "";
        distanceInput.readOnly = true;
        console.info(
          `[CONFIG] Route not found: ${origin} → ${destination}. Manual entry suggested.`
        );
      }
    };

    /**
     * Toggles readonly state based on manual distance checkbox.
     * @private
     */
    const toggleManualMode = () => {
      if (!manualCheckbox) return;

      if (manualCheckbox.checked) {
        // Enable manual entry
        distanceInput.readOnly = false;
        distanceInput.classList.remove("is-success", "is-warning");
        console.log("[CONFIG] Manual distance entry enabled");
      } else {
        // Disable manual entry and restore autofill
        distanceInput.readOnly = true;
        distanceInput.value = "";
        attemptAutofill();
        console.log("[CONFIG] Manual distance entry disabled");
      }
    };

    // Listen to changes on origin and destination inputs
    originInput.addEventListener("input", attemptAutofill);
    originInput.addEventListener("change", attemptAutofill);
    originInput.addEventListener("blur", attemptAutofill);

    destinationInput.addEventListener("input", attemptAutofill);
    destinationInput.addEventListener("change", attemptAutofill);
    destinationInput.addEventListener("blur", attemptAutofill);

    // Listen to manual distance checkbox
    if (manualCheckbox) {
      manualCheckbox.addEventListener("change", toggleManualMode);
    }

    console.log("[CONFIG] Distance autofill behavior initialized");
  },

  /**
   * Retrieves the emission factor for a transport mode.
   * 
   * @function getEmissionFactor
   * @param {string} transportMode - The transport mode key
   * @returns {number} CO₂ grams per kilometer, or 0 if mode not found
   * @example
   * CONFIG.getEmissionFactor("car") // Returns: 120
   */
  getEmissionFactor(transportMode) {
    return this.emissionFactors[transportMode] || 0;
  },

  /**
   * Retrieves metadata for a transport mode.
   * 
   * @function getTransportMetadata
   * @param {string} transportMode - The transport mode key
   * @returns {Object|null} Transport mode metadata or null if not found
   * @example
   * CONFIG.getTransportMetadata("bus")
   * // Returns: { label: "Ônibus", emoji: "🚌", color: "#f97316" }
   */
  getTransportMetadata(transportMode) {
    return this.transportModes[transportMode] || null;
  },

  /**
   * Calculates total CO₂ emissions for a trip.
   * 
   * @function calculateEmissions
   * @param {number} distanceKm - Distance in kilometers
   * @param {string} transportMode - Transport mode key
   * @returns {number} Total CO₂ in grams
   * @example
   * CONFIG.calculateEmissions(430, "car") // Returns: 51600
   */
  calculateEmissions(distanceKm, transportMode) {
    const factor = this.getEmissionFactor(transportMode);
    return distanceKm * factor;
  },

  /**
   * Gets the appropriate carbon credit category based on CO₂ amount.
   * 
   * @function getGreenCategory
   * @param {number} coGrams - CO₂ emissions in grams
   * @returns {Object} Category object with label, emoji, and color
   * @example
   * CONFIG.getGreenCategory(150) // Returns: { max: 300, label: "Bom", emoji: "🌿", color: "#34d399" }
   */
  getGreenCategory(coGrams) {
    const categories = this.carbonCredits.greenCategories;

    for (const [key, category] of Object.entries(categories)) {
      if (coGrams <= category.max) {
        return category;
      }
    }

    return categories.high;
  },

  /**
   * Calculates equivalent trees needed for carbon offset.
   * 
   * @function calculateTreesEquivalent
   * @param {number} coGrams - CO₂ emissions in grams
   * @returns {number} Number of trees needed for full offset
   * @example
   * CONFIG.calculateTreesEquivalent(20000) // Returns: 1
   */
  calculateTreesEquivalent(coGrams) {
    const coPerTree = this.carbonCredits.coPerTree;
    return Math.ceil(coGrams / coPerTree);
  },
};

// Make CONFIG available globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
