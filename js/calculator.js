/**
 * Calculator - Pure Calculation Engine
 * ====================================
 * 
 * A stateless, pure calculation module for CO₂ emissions and carbon credits.
 * Handles all mathematical operations without DOM manipulation.
 * 
 * All inputs and outputs are validated. Numbers are rounded to appropriate
 * precision levels for display and calculations.
 * 
 * @module calculator
 * @version 1.0.0
 */

const Calculator = {
  /**
   * Default carbon credit price in USD per ton of CO₂.
   * Used for offset price estimation (market average).
   * 
   * @type {number}
   */
  defaultCreditPrice: 15,

  /**
   * Precision levels for rounding different metric types.
   * 
   * @type {Object}
   */
  precision: {
    emissions: 0, // Round to whole number (grams)
    distance: 1, // One decimal place
    trees: 2, // Two decimal places
    price: 2, // Two decimal places (currency)
  },

  /**
   * Validates and normalizes input values.
   * 
   * @private
   * @param {*} value - Value to validate
   * @param {string} type - Type: "distance" or "emissions"
   * @returns {number} Validated number
   * @throws {Error} If value is invalid
   */
  _validateInput(value, type = "distance") {
    const num = parseFloat(value);

    if (isNaN(num)) {
      throw new Error(`[Calculator] Invalid ${type} value: ${value}`);
    }

    if (num < 0) {
      throw new Error(`[Calculator] ${type} cannot be negative: ${num}`);
    }

    return num;
  },

  /**
   * Rounds a number to a specified number of decimal places.
   * Uses standard mathematical rounding (banker's rounding).
   * 
   * @private
   * @param {number} value - Number to round
   * @param {number} decimals - Decimal places (default: 0)
   * @returns {number} Rounded number
   * @example
   * _round(1234.567, 2) // Returns: 1234.57
   */
  _round(value, decimals = 0) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  },

  /**
   * Calculates CO₂ emissions for a single transport mode.
   * 
   * Formula: CO₂ (grams) = Distance (km) × Emission Factor (g/km)
   * 
   * @function calculateEmission
   * @param {number} distanceKm - Distance traveled in kilometers
   * @param {string} transportMode - Transport mode key (bicycle, car, bus, truck)
   * @returns {number} CO₂ emissions in grams (rounded to nearest integer)
   * @throws {Error} If inputs are invalid
   * 
   * @example
   * Calculator.calculateEmission(430, "car") // Returns: 51600
   * @example
   * Calculator.calculateEmission(430, "bus") // Returns: 21500
   */
  calculateEmission(distanceKm, transportMode) {
    const distance = this._validateInput(distanceKm, "distance");

    if (!(transportMode in CONFIG.emissionFactors)) {
      throw new Error(`[Calculator] Unknown transport mode: ${transportMode}`);
    }

    const emissionFactor = CONFIG.getEmissionFactor(transportMode);

    // Formula: emissions = distance × factor
    const emissions = distance * emissionFactor;

    return this._round(emissions, this.precision.emissions);
  },

  /**
   * Calculates CO₂ emissions for all transport modes.
   * Generates a comparison showing relative impact of each option.
   * 
   * @function calculateAllModes
   * @param {number} distanceKm - Distance in kilometers
   * @returns {Object} Object with transport modes as keys and emissions as values
   * @throws {Error} If distance is invalid
   * 
   * @example
   * Calculator.calculateAllModes(430)
   * // Returns: {
   * //   bicycle: 0,
   * //   car: 51600,
   * //   bus: 21500,
   * //   truck: 34400
   * // }
   */
  calculateAllModes(distanceKm) {
    const distance = this._validateInput(distanceKm, "distance");
    const results = {};

    Object.keys(CONFIG.transportModes).forEach((mode) => {
      results[mode] = this.calculateEmission(distance, mode);
    });

    return results;
  },

  /**
   * Calculates CO₂ savings by switching from one mode to another.
   * 
   * Formula: Savings (grams) = Baseline Emissions - Alternative Emissions
   * Percentage: (Savings / Baseline) × 100
   * 
   * @function calculateSavings
   * @param {number} baselineEmissions - CO₂ from baseline mode (grams)
   * @param {number} alternativeEmissions - CO₂ from alternative mode (grams)
   * @returns {Object} Savings data with absolute and percentage values
   * @throws {Error} If inputs are invalid
   * 
   * @example
   * Calculator.calculateSavings(51600, 21500)
   * // Returns: {
   * //   savedGrams: 30100,
   * //   savedKg: 30.1,
   * //   percentageReduction: 58.33,
   * //   isMoneyPositive: true
   * // }
   */
  calculateSavings(baselineEmissions, alternativeEmissions) {
    const baseline = this._validateInput(baselineEmissions, "emissions");
    const alternative = this._validateInput(alternativeEmissions, "emissions");

    // Save as positive number
    const savedGrams = baseline - alternative;
    const savedKg = savedGrams / 1000;

    // Calculate percentage reduction
    const percentageReduction =
      baseline > 0
        ? this._round((savedGrams / baseline) * 100, 2)
        : 0;

    return {
      savedGrams: this._round(savedGrams, this.precision.emissions),
      savedKg: this._round(savedKg, 2),
      percentageReduction: percentageReduction,
      isPositive: savedGrams >= 0,
    };
  },

  /**
   * Calculates carbon credit offset requirements.
   * Uses tree equivalents and carbon offset standards.
   * 
   * Formulas:
   * - Trees Needed = CO₂ (grams) / CO₂ per Tree per Year
   * - Carbon Tons = CO₂ (grams) / 1,000,000
   * 
   * @function calculateCarbonCredits
   * @param {number} coEmissionsGrams - Total CO₂ emissions in grams
   * @returns {Object} Credit offset data
   * @throws {Error} If inputs are invalid
   * 
   * @example
   * Calculator.calculateCarbonCredits(51600)
   * // Returns: {
   * //   treeEquivalent: 3,
   * //   treesRounded: 3,
   * //   carbonTons: 0.05,
   * //   offsetYears: 1
   * // }
   */
  calculateCarbonCredits(coEmissionsGrams) {
    const emissions = this._validateInput(coEmissionsGrams, "emissions");

    // Calculate tree equivalent
    const coPerTree = CONFIG.carbonCredits.coPerTree;
    const treeEquivalent = emissions / coPerTree;
    const treesRounded = Math.ceil(treeEquivalent);

    // Calculate carbon tons (metric tons = 1,000,000 grams)
    const carbonTons = this._round(emissions / 1000000, 4);

    // Offset period (how many years of tree growth needed)
    const offsetYears = treesRounded > 0 ? treesRounded : 0;

    return {
      treeEquivalent: this._round(treeEquivalent, this.precision.trees),
      treesRounded: treesRounded,
      carbonTons: carbonTons,
      offsetYears: offsetYears,
    };
  },

  /**
   * Estimates the monetary value of carbon credits for emissions.
   * Useful for understanding market-based offset costs.
   * 
   * Formula: Credit Price (USD) = (CO₂ grams / 1,000,000) × Price Per Ton
   * 
   * @function estimateCreditPrice
   * @param {number} coEmissionsGrams - CO₂ emissions in grams
   * @param {number} [pricePerTon] - Carbon credit price in USD/ton (optional)
   * @returns {Object} Price estimate data
   * @throws {Error} If inputs are invalid
   * 
   * @example
   * Calculator.estimateCreditPrice(51600, 15)
   * // Returns: {
   * //   estimatedPrice: 0.77,
   * //   currency: "USD",
   * //   pricePerTon: 15,
   * //   carbonTons: 0.05
   * // }
   */
  estimateCreditPrice(coEmissionsGrams, pricePerTon = this.defaultCreditPrice) {
    const emissions = this._validateInput(coEmissionsGrams, "emissions");
    const price = this._validateInput(pricePerTon, "price");

    // Convert grams to metric tons
    const carbonTons = emissions / 1000000;

    // Calculate price: tons × price per ton
    const estimatedPrice = this._round(
      carbonTons * price,
      this.precision.price
    );

    return {
      estimatedPrice: estimatedPrice,
      currency: "USD",
      pricePerTon: price,
      carbonTons: this._round(carbonTons, 4),
    };
  },

  /**
   * Comprehensive emissions analysis for a trip.
   * Combines all calculations for complete overview.
   * 
   * @function analyzeTrip
   * @param {number} distanceKm - Distance in kilometers
   * @param {string} transportMode - Selected transport mode
   * @returns {Object} Complete analysis object
   * @throws {Error} If inputs are invalid
   * 
   * @example
   * Calculator.analyzeTrip(430, "car")
   * // Returns comprehensive object with emissions, savings, credits, etc.
   */
  analyzeTrip(distanceKm, transportMode) {
    const distance = this._validateInput(distanceKm, "distance");

    // Calculate for all modes
    const allModes = this.calculateAllModes(distance);
    const selectedEmission = this.calculateEmission(distance, transportMode);

    // Get lowest emission (baseline for comparison)
    const minEmission = Math.min(...Object.values(allModes));
    const maxEmission = Math.max(...Object.values(allModes));

    // Calculate savings vs worst option
    const savings = this.calculateSavings(maxEmission, selectedEmission);

    // Calculate credits
    const credits = this.calculateCarbonCredits(selectedEmission);

    // Estimate offset price
    const priceEstimate = this.estimateCreditPrice(selectedEmission);

    // Get category
    const category = CONFIG.getGreenCategory(selectedEmission);

    return {
      distance: distance,
      transportMode: transportMode,
      selectedEmission: selectedEmission,
      allModes: allModes,
      minEmission: minEmission,
      maxEmission: maxEmission,
      savings: savings,
      credits: credits,
      priceEstimate: priceEstimate,
      category: category,
      metadata: CONFIG.getTransportMetadata(transportMode),
    };
  },

  /**
   * Gets supported transport modes.
   * 
   * @function getSupportedModes
   * @returns {Array<string>} Array of valid transport mode keys
   */
  getSupportedModes() {
    return Object.keys(CONFIG.transportModes);
  },
};

// Make Calculator available globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = Calculator;
}
