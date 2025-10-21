export class CountryInfoDisplay {
  static show(country) {
    const panel = document.getElementById("info-panel");
    const nameEl = document.getElementById("country-name");
    const dataEl = document.getElementById("country-data");

    if (!panel || !nameEl || !dataEl) return;

    nameEl.innerHTML = `${country.flag || "🌍"} ${country.name}`;
    dataEl.innerHTML = this.generateCountryHTML(country);
    panel.classList.remove("hidden");
  }

  static generateCountryHTML(country) {
    return `
            <div class="data-section">
                <h4>Basic Information</h4>
                <div class="data-item">
                    <span class="data-label">Capital</span>
                    <span>${country.capital || "N/A"}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Population</span>
                    <span>${(country.population || 0).toLocaleString()}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Area</span>
                    <span>${(country.area || 0).toLocaleString()} km²</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Region</span>
                    <span>${country.region || "N/A"}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Languages</span>
                    <span>${
                      Array.isArray(country.languages)
                        ? country.languages.join(", ")
                        : country.languages || "N/A"
                    }</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Currency</span>
                    <span>${country.currency || "N/A"}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Government</span>
                    <span>${country.government || "N/A"}</span>
                </div>
            </div>

            <div class="data-section">
                <h4>Economic Data</h4>
                <div class="data-item">
                    <span class="data-label">GDP</span>
                    <span>$${((country.gdp || 0) / 1000000000).toFixed(
                      2
                    )}B</span>
                </div>
                <div class="data-item">
                    <span class="data-label">GDP per Capita</span>
                    <span>$${(
                      country.gdpPerCapita || 0
                    ).toLocaleString()}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Unemployment Rate</span>
                    <span>${country.unemploymentRate || "N/A"}%</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Inflation Rate</span>
                    <span>${country.inflationRate || "N/A"}%</span>
                </div>
            </div>

            <div class="data-section">
                <h4>Social Indicators</h4>
                <div class="data-item">
                    <span class="data-label">Life Expectancy</span>
                    <span>${country.lifeExpectancy || "N/A"} years</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Literacy Rate</span>
                    <span>${country.literacyRate || "N/A"}%</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Internet Users</span>
                    <span>${country.internetUsers || "N/A"}%</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Urban Population</span>
                    <span>${country.urbanPopulation || "N/A"}%</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Human Development Index</span>
                    <span>${country.humanDevelopmentIndex || "N/A"}</span>
                </div>
            </div>

            <div class="data-section">
                <h4>Environment & Climate</h4>
                <div class="data-item">
                    <span class="data-label">Environment Score</span>
                    <span>${country.environmentScore || "N/A"}/100</span>
                </div>
                <div class="data-item">
                    <span class="data-label">CO₂ Emissions</span>
                    <span>${country.co2Emissions || "N/A"} Mt</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Renewable Energy</span>
                    <span>${country.renewableEnergy || "N/A"}%</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Forest Coverage</span>
                    <span>${country.forestCoverage || "N/A"}%</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Climate Zone</span>
                    <span>${country.climateZone || "N/A"}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Average Temperature</span>
                    <span>${country.averageTemp || "N/A"}°C</span>
                </div>
            </div>

            <div class="data-section">
                <h4>Culture & Tourism</h4>
                <div class="data-item">
                    <span class="data-label">Cultural Sites</span>
                    <span>${country.culturalSites || "N/A"}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Museums</span>
                    <span>${country.museums || "N/A"}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Annual Festivals</span>
                    <span>${country.festivals || "N/A"}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Tourist Arrivals</span>
                    <span>${((country.touristArrivals || 0) / 1000000).toFixed(
                      1
                    )}M/year</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Tourism Revenue</span>
                    <span>$${(
                      (country.tourismRevenue || 0) / 1000000000
                    ).toFixed(1)}B</span>
                </div>
            </div>

            <div class="data-section">
                <h4>Quality of Life</h4>
                <div class="data-item">
                    <span class="data-label">Happiness Index</span>
                    <span>${country.happinessIndex || "N/A"}/10</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Democracy Index</span>
                    <span>${country.democracyIndex || "N/A"}/10</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Healthcare Index</span>
                    <span>${country.healthcareIndex || "N/A"}/100</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Education Index</span>
                    <span>${country.educationIndex || "N/A"}/100</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Innovation Index</span>
                    <span>${country.innovationIndex || "N/A"}/100</span>
                </div>
            </div>

            <div class="data-section">
                <h4>Infrastructure & Technology</h4>
                <div class="data-item">
                    <span class="data-label">Internet Speed</span>
                    <span>${country.internetSpeed || "N/A"} Mbps</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Road Quality</span>
                    <span>${country.roadQuality || "N/A"}/100</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Electricity Access</span>
                    <span>${country.electricityAccess || "N/A"}%</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Patents Filed</span>
                    <span>${(country.patents || 0).toLocaleString()}</span>
                </div>
            </div>
        `;
  }
}
