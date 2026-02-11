/**
 * RoutesDB - Client-Side Route Distance API
 * ============================================
 * 
 * Manages a comprehensive database of Brazilian city routes with distances.
 * This module provides distance lookup capabilities between major Brazilian
 * cities, capitals, and regional hubs.
 * 
 * All distances are in kilometers (km) and represent approximate straight-line
 * or primary highway routes.
 * 
 * @module routes-data
 * @version 1.0.0
 */

const RoutesDB = {
  /**
   * Route database containing 40 Brazilian city pairs with distances in KM.
   * Includes capitals, regional hubs, and economically important centers.
   * 
   * @type {Array<Object>}
   * @property {string} origin - Origin city with state abbreviation
   * @property {string} destination - Destination city with state abbreviation
   * @property {number} distanceKm - Distance in kilometers
   */
  routes: [
    // Southeast Region
    { origin: "São Paulo, SP", destination: "Rio de Janeiro, RJ", distanceKm: 430 },
    { origin: "São Paulo, SP", destination: "Belo Horizonte, MG", distanceKm: 586 },
    { origin: "São Paulo, SP", destination: "Curitiba, PR", distanceKm: 408 },
    { origin: "Rio de Janeiro, RJ", destination: "Belo Horizonte, MG", distanceKm: 450 },
    { origin: "Belo Horizonte, MG", destination: "Curitiba, PR", distanceKm: 896 },
    { origin: "Vitória, ES", destination: "Rio de Janeiro, RJ", distanceKm: 521 },
    { origin: "Vitória, ES", destination: "Belo Horizonte, MG", distanceKm: 385 },

    // Center-West Region
    { origin: "Brasília, DF", destination: "Goiânia, GO", distanceKm: 209 },
    { origin: "Brasília, DF", destination: "São Paulo, SP", distanceKm: 1150 },
    { origin: "Brasília, DF", destination: "Rio de Janeiro, RJ", distanceKm: 1200 },
    { origin: "Brasília, DF", destination: "Cuiabá, MT", distanceKm: 915 },
    { origin: "Goiânia, GO", destination: "São Paulo, SP", distanceKm: 933 },
    { origin: "Cuiabá, MT", destination: "Goiânia, GO", distanceKm: 705 },

    // South Region
    { origin: "Curitiba, PR", destination: "Porto Alegre, RS", distanceKm: 710 },
    { origin: "Porto Alegre, RS", destination: "São Paulo, SP", distanceKm: 1150 },
    { origin: "Florianópolis, SC", destination: "Curitiba, PR", distanceKm: 300 },
    { origin: "Florianópolis, SC", destination: "Porto Alegre, RS", distanceKm: 835 },

    // Northeast Region
    { origin: "Salvador, BA", destination: "Recife, PE", distanceKm: 800 },
    { origin: "Salvador, BA", destination: "Fortaleza, CE", distanceKm: 1200 },
    { origin: "Recife, PE", destination: "Fortaleza, CE", distanceKm: 560 },
    { origin: "Fortaleza, CE", destination: "Teresina, PI", distanceKm: 600 },
    { origin: "Teresina, PI", destination: "São Luiz, MA", distanceKm: 370 },
    { origin: "São Luiz, MA", destination: "Recife, PE", distanceKm: 970 },
    { origin: "Maceió, AL", destination: "Recife, PE", distanceKm: 280 },
    { origin: "Natal, RN", destination: "Fortaleza, CE", distanceKm: 530 },

    // North Region
    { origin: "Manaus, AM", destination: "Brasília, DF", distanceKm: 2700 },
    { origin: "Manaus, AM", destination: "Belém, PA", distanceKm: 1700 },
    { origin: "Belém, PA", destination: "São Luiz, MA", distanceKm: 800 },
    { origin: "Belém, PA", destination: "Brasília, DF", distanceKm: 2100 },
    { origin: "Boa Vista, RR", destination: "Manaus, AM", distanceKm: 800 },
    { origin: "Macapá, AP", destination: "Belém, PA", distanceKm: 670 },
    { origin: "Rio Branco, AC", destination: "Manaus, AM", distanceKm: 1350 },
    { origin: "Palmas, TO", destination: "Goiânia, GO", distanceKm: 925 },

    // Interior & Strategic Routes
    { origin: "Ribeirão Preto, SP", destination: "São Paulo, SP", distanceKm: 315 },
    { origin: "Campinas, SP", destination: "Rio de Janeiro, RJ", distanceKm: 350 },
    { origin: "Londrina, PR", destination: "São Paulo, SP", distanceKm: 540 },
    { origin: "Maringá, PR", destination: "Curitiba, PR", distanceKm: 400 },
    { origin: "Uberlândia, MG", destination: "Brasília, DF", distanceKm: 470 },
    { origin: "Juiz de Fora, MG", destination: "Rio de Janeiro, RJ", distanceKm: 260 },
    { origin: "Campina Grande, PB", destination: "Recife, PE", distanceKm: 210 },
    { origin: "Aracaju, SE", destination: "Maceió, AL", distanceKm: 200 },
  ],

  /**
   * Retrieves all unique cities from the routes database.
   * 
   * Extracts unique city names from both origin and destination fields,
   * removes duplicates, and returns them in alphabetical order.
   * 
   * @returns {string[]} Alphabetically sorted array of unique cities with states
   * @example
   * const cities = RoutesDB.getAllCities();
   * // Returns: ["Aracaju, SE", "Belém, PA", "Belo Horizonte, MG", ...]
   */
  getAllCities() {
    const citiesSet = new Set();

    // Extract all cities from routes
    this.routes.forEach((route) => {
      citiesSet.add(route.origin);
      citiesSet.add(route.destination);
    });

    // Convert to array and sort alphabetically
    return Array.from(citiesSet).sort();
  },

  /**
   * Finds the distance between two cities.
   * 
   * Normalizes input strings (trim + lowercase conversion) and searches
   * for routes in both directions (origin->destination and destination->origin).
   * Returns the distance if found, null otherwise.
   * 
   * @param {string} origin - Origin city (case-insensitive, spaces trimmed)
   * @param {string} destination - Destination city (case-insensitive, spaces trimmed)
   * @returns {number|null} Distance in kilometers, or null if route not found
   * @example
   * const distance = RoutesDB.findDistance("São Paulo, SP", "Rio de Janeiro, RJ");
   * // Returns: 430
   * 
   * @example
   * const distance = RoutesDB.findDistance("Rio de Janeiro, RJ", "São Paulo, SP");
   * // Returns: 430 (works in both directions)
   */
  findDistance(origin, destination) {
    // Normalize inputs
    const normalizedOrigin = origin.trim().toLowerCase();
    const normalizedDestination = destination.trim().toLowerCase();

    // Search for route in both directions
    for (const route of this.routes) {
      const routeOrigin = route.origin.toLowerCase();
      const routeDestination = route.destination.toLowerCase();

      // Check forward direction
      if (routeOrigin === normalizedOrigin && routeDestination === normalizedDestination) {
        return route.distanceKm;
      }

      // Check reverse direction (bidirectional)
      if (routeOrigin === normalizedDestination && routeDestination === normalizedOrigin) {
        return route.distanceKm;
      }
    }

    // Route not found
    return null;
  },
};

// Make RoutesDB available globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = RoutesDB;
}
