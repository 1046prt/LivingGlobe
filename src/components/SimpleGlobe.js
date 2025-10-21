import * as THREE from "three";

export class SimpleGlobe {
  constructor(scene, dataManager) {
    this.scene = scene;
    this.dataManager = dataManager;
    this.globeMesh = null;
    this.countryMarkers = [];

    // Mouse interaction
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.hoveredCountry = null;

    this.initMouseEvents();
  }

  async init() {
    console.log("SimpleGlobe: Creating basic globe...");

    // Create a simple blue sphere
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      shininess: 100,
    });

    this.globeMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.globeMesh);

    // Add some simple country markers
    this.createSimpleCountries();

    console.log("SimpleGlobe: Basic globe created successfully");
  }

  createCountryLabel(countryName, x, y, z) {
    // Create a canvas for the text
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 64;

    // Style the text
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "white";
    context.font = "16px Arial";
    context.textAlign = "center";
    context.fillText(countryName, canvas.width / 2, canvas.height / 2 + 6);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);

    // Create sprite material
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8,
    });

    // Create sprite
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x * 1.2, y * 1.2, z * 1.2); // Position slightly outside the globe
    sprite.scale.set(0.3, 0.1, 1);

    this.scene.add(sprite);
  }

  createSimpleCountries() {
    const countries = this.dataManager.getCountries();
    console.log(
      "SimpleGlobe: Creating markers for",
      countries.length,
      "countries"
    );

    countries.forEach((country, index) => {
      const lat = country.lat || 0;
      const lon = country.lon || 0;

      // Convert lat/lon to 3D position
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const radius = 1.05;

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      // Create a marker with size based on population
      const populationScale =
        Math.log(country.population || 1000000) / Math.log(1000000000);
      const markerSize = Math.max(
        0.015,
        Math.min(0.035, 0.015 + populationScale * 0.02)
      );

      const markerGeometry = new THREE.SphereGeometry(markerSize, 8, 8);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6b6b,
      });

      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, y, z);
      marker.userData = { country };

      this.countryMarkers.push(marker);
      this.scene.add(marker);

      // Add country name label
      this.createCountryLabel(country.name, x, y, z);
    });
  }

  initMouseEvents() {
    // Mouse events will be handled by main.js to avoid conflicts
    // This method is kept for compatibility
  }

  updateMousePosition(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.handleMouseMove();
  }

  handleMouseMove() {
    // Get camera from the scene
    const camera = this.scene.userData.camera;
    if (!camera) return;

    this.raycaster.setFromCamera(this.mouse, camera);
    const intersects = this.raycaster.intersectObjects(this.countryMarkers);

    if (intersects.length > 0) {
      const country = intersects[0].object.userData.country;

      if (this.hoveredCountry !== country) {
        this.hoveredCountry = country;
        this.showTooltip(country);

        // Highlight the marker
        intersects[0].object.material.color.setHex(0x00ff00);
      }
    } else {
      if (this.hoveredCountry) {
        this.hoveredCountry = null;
        this.hideTooltip();

        // Reset all marker colors
        this.countryMarkers.forEach((marker) => {
          marker.material.color.setHex(0xff6b6b);
        });
      }
    }
  }

  handleClick() {
    if (this.hoveredCountry) {
      this.showCountryInfo(this.hoveredCountry);
    }
  }

  showTooltip(country) {
    const tooltip = document.getElementById("tooltip");
    const content = document.querySelector(".tooltip-content");

    if (!tooltip || !content) return;

    content.innerHTML = `
      <strong>${country.flag || "🌍"} ${country.name}</strong><br>
      Population: ${(country.population || 0).toLocaleString()}<br>
      Capital: ${country.capital || "N/A"}
    `;

    tooltip.classList.remove("hidden");
    tooltip.style.left =
      (this.mouse.x * window.innerWidth) / 2 +
      window.innerWidth / 2 +
      10 +
      "px";
    tooltip.style.top =
      (-this.mouse.y * window.innerHeight) / 2 +
      window.innerHeight / 2 +
      10 +
      "px";
  }

  hideTooltip() {
    const tooltip = document.getElementById("tooltip");
    if (tooltip) {
      tooltip.classList.add("hidden");
    }
  }

  showCountryInfo(country) {
    const panel = document.getElementById("info-panel");
    const nameEl = document.getElementById("country-name");
    const dataEl = document.getElementById("country-data");

    if (!panel || !nameEl || !dataEl) return;

    nameEl.innerHTML = `${country.flag || "🌍"} ${country.name} (${
      country.iso2 || ""
    })`;

    let content = `
      <div class="data-section">
        <h4>🏛️ Basic Information</h4>
        <div class="data-item">
          <span class="data-label">Capital</span>
          <span>${country.capital || "N/A"}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Population</span>
          <span>${(country.population || 0).toLocaleString()}</span>
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
          <span>${
            country.currencyData
              ? `${country.currencyData.name} (${country.currencyData.code}) ${country.currencyData.symbol}`
              : country.currency || "N/A"
          }</span>
        </div>
        <div class="data-item">
          <span class="data-label">Timezones</span>
          <span>${
            Array.isArray(country.timezones)
              ? country.timezones.join(", ")
              : "N/A"
          }</span>
        </div>
      </div>`;

    // Heritage & History
    if (country.heritage) {
      content += `
        <div class="data-section">
          <h4>🏛️ Heritage & History</h4>
          <div class="data-item">
            <span class="data-label">Independence</span>
            <span>${country.heritage.independenceDate || "N/A"}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Founding Event</span>
            <span>${country.heritage.foundingEvent || "N/A"}</span>
          </div>`;

      if (
        country.heritage.majorHistoricalFigures &&
        country.heritage.majorHistoricalFigures.length > 0
      ) {
        const figure = country.heritage.majorHistoricalFigures[0];
        content += `
          <div class="data-item">
            <span class="data-label">Historical Figure</span>
            <span>${figure.name} - ${figure.role} (${figure.period})</span>
          </div>`;
      }

      if (
        country.heritage.unescoSites &&
        country.heritage.unescoSites.length > 0
      ) {
        content += `
          <div class="data-item">
            <span class="data-label">UNESCO Sites</span>
            <span>${country.heritage.unescoSites.length} sites</span>
          </div>`;

        country.heritage.unescoSites.slice(0, 3).forEach((site) => {
          content += `
            <div class="data-item">
              <span class="data-label">${site.name}</span>
              <span>${site.type} (${site.year})</span>
            </div>`;
        });
      }
      content += `</div>`;
    }

    // Government & Politics
    if (country.politics) {
      content += `
        <div class="data-section">
          <h4>🏛️ Government & Politics</h4>
          <div class="data-item">
            <span class="data-label">Government Type</span>
            <span>${country.politics.governmentType || "N/A"}</span>
          </div>`;

      if (
        country.politics.currentLeaders &&
        country.politics.currentLeaders.length > 0
      ) {
        country.politics.currentLeaders.forEach((leader) => {
          content += `
            <div class="data-item">
              <span class="data-label">${leader.position}</span>
              <span>${leader.name} (${leader.party || "N/A"})</span>
            </div>`;
        });
      }

      if (
        country.politics.internationalMemberships &&
        country.politics.internationalMemberships.length > 0
      ) {
        content += `
          <div class="data-item">
            <span class="data-label">International Memberships</span>
            <span>${country.politics.internationalMemberships
              .slice(0, 3)
              .join(", ")}${
          country.politics.internationalMemberships.length > 3 ? "..." : ""
        }</span>
          </div>`;
      }
      content += `</div>`;
    }

    // Economy
    if (country.economy) {
      content += `
        <div class="data-section">
          <h4>💰 Economy</h4>
          <div class="data-item">
            <span class="data-label">GDP</span>
            <span>$${((country.economy.gdp || 0) / 1000000000).toFixed(
              2
            )}B</span>
          </div>
          <div class="data-item">
            <span class="data-label">GDP per Capita</span>
            <span>$${(
              country.economy.gdpPerCapita || 0
            ).toLocaleString()}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Employment Rate</span>
            <span>${country.economy.employmentRate || "N/A"}%</span>
          </div>`;

      if (
        country.economy.majorIndustries &&
        country.economy.majorIndustries.length > 0
      ) {
        content += `
          <div class="data-item">
            <span class="data-label">Major Industries</span>
            <span>${country.economy.majorIndustries
              .slice(0, 4)
              .join(", ")}</span>
          </div>`;
      }

      if (country.economy.topExports && country.economy.topExports.length > 0) {
        const topExport = country.economy.topExports[0];
        content += `
          <div class="data-item">
            <span class="data-label">Top Export</span>
            <span>${topExport.product} ($${(
          topExport.value / 1000000000
        ).toFixed(1)}B)</span>
          </div>`;
      }

      if (country.economy.employmentSectors) {
        content += `
          <div class="data-item">
            <span class="data-label">Employment Sectors</span>
            <span>Services: ${country.economy.employmentSectors.services}%, Industry: ${country.economy.employmentSectors.industry}%, Agriculture: ${country.economy.employmentSectors.agriculture}%</span>
          </div>`;
      }
      content += `</div>`;
    }

    // Demographics
    if (country.demographics) {
      content += `
        <div class="data-section">
          <h4>👥 Demographics</h4>`;

      if (country.demographics.lifeExpectancy) {
        content += `
          <div class="data-item">
            <span class="data-label">Life Expectancy</span>
            <span>${country.demographics.lifeExpectancy.total} years (M: ${country.demographics.lifeExpectancy.male}, F: ${country.demographics.lifeExpectancy.female})</span>
          </div>`;
      }

      if (country.demographics.urbanRural) {
        content += `
          <div class="data-item">
            <span class="data-label">Urban/Rural</span>
            <span>Urban: ${country.demographics.urbanRural.urban}%, Rural: ${country.demographics.urbanRural.rural}%</span>
          </div>`;
      }

      if (country.demographics.ageDistribution) {
        content += `
          <div class="data-item">
            <span class="data-label">Age Distribution</span>
            <span>Youth: ${country.demographics.ageDistribution.youth}%, Working: ${country.demographics.ageDistribution.workingAge}%, Elderly: ${country.demographics.ageDistribution.elderly}%</span>
          </div>`;
      }
      content += `</div>`;
    }

    // Culture
    if (country.culture) {
      content += `
        <div class="data-section">
          <h4>🎭 Culture</h4>`;

      if (
        country.culture.officialLanguages &&
        country.culture.officialLanguages.length > 0
      ) {
        content += `
          <div class="data-item">
            <span class="data-label">Official Languages</span>
            <span>${country.culture.officialLanguages.join(", ")}</span>
          </div>`;
      }

      if (country.culture.religionDemographics) {
        const religions = Object.entries(
          country.culture.religionDemographics
        ).slice(0, 3);
        content += `
          <div class="data-item">
            <span class="data-label">Major Religions</span>
            <span>${religions
              .map(([religion, percent]) => `${religion}: ${percent}%`)
              .join(", ")}</span>
          </div>`;
      }

      if (
        country.culture.nationalFestivals &&
        country.culture.nationalFestivals.length > 0
      ) {
        country.culture.nationalFestivals.slice(0, 2).forEach((festival) => {
          content += `
            <div class="data-item">
              <span class="data-label">${festival.name}</span>
              <span>${festival.date} - ${festival.description}</span>
            </div>`;
        });
      }

      if (
        country.culture.traditionalFoods &&
        country.culture.traditionalFoods.length > 0
      ) {
        country.culture.traditionalFoods.slice(0, 2).forEach((food) => {
          content += `
            <div class="data-item">
              <span class="data-label">${food.name}</span>
              <span>${food.description}</span>
            </div>`;
        });
      }

      if (country.culture.nationalSymbols) {
        content += `
          <div class="data-item">
            <span class="data-label">National Symbols</span>
            <span>Anthem: ${
              country.culture.nationalSymbols.anthem || "N/A"
            }, Bird: ${
          country.culture.nationalSymbols.bird || "N/A"
        }, Flower: ${country.culture.nationalSymbols.flower || "N/A"}</span>
          </div>`;
      }
      content += `</div>`;
    }

    // Education
    if (country.education) {
      content += `
        <div class="data-section">
          <h4>🎓 Education</h4>
          <div class="data-item">
            <span class="data-label">Literacy Rate</span>
            <span>${country.education.literacyRate || "N/A"}%</span>
          </div>
          <div class="data-item">
            <span class="data-label">Education System</span>
            <span>${country.education.educationSystem || "N/A"}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Nobel Prize Winners</span>
            <span>${country.education.nobelPrizeWinners || "N/A"}</span>
          </div>`;

      if (
        country.education.famousScientists &&
        country.education.famousScientists.length > 0
      ) {
        const scientist = country.education.famousScientists[0];
        content += `
          <div class="data-item">
            <span class="data-label">Notable Scientist</span>
            <span>${scientist.name} - ${scientist.field} (${scientist.achievement})</span>
          </div>`;
      }
      content += `</div>`;
    }

    // Tourism
    if (country.tourism) {
      content += `
        <div class="data-section">
          <h4>🏖️ Tourism</h4>`;

      if (
        country.tourism.mostVisitedCities &&
        country.tourism.mostVisitedCities.length > 0
      ) {
        country.tourism.mostVisitedCities.slice(0, 3).forEach((city) => {
          content += `
            <div class="data-item">
              <span class="data-label">${city.name}</span>
              <span>${(city.visitors || 0).toLocaleString()} visitors - ${
            city.attractions ? city.attractions.slice(0, 2).join(", ") : ""
          }</span>
            </div>`;
        });
      }

      if (
        country.tourism.adventureActivities &&
        country.tourism.adventureActivities.length > 0
      ) {
        content += `
          <div class="data-item">
            <span class="data-label">Adventure Activities</span>
            <span>${country.tourism.adventureActivities
              .slice(0, 3)
              .join(", ")}</span>
          </div>`;
      }

      if (country.tourism.visaRequirements) {
        content += `
          <div class="data-item">
            <span class="data-label">Visa Requirements</span>
            <span>${country.tourism.visaRequirements}</span>
          </div>`;
      }
      content += `</div>`;
    }

    // Geography
    if (country.geography) {
      content += `
        <div class="data-section">
          <h4>🌍 Geography</h4>`;

      if (
        country.geography.climateZones &&
        country.geography.climateZones.length > 0
      ) {
        content += `
          <div class="data-item">
            <span class="data-label">Climate Zones</span>
            <span>${country.geography.climateZones.join(", ")}</span>
          </div>`;
      }

      if (
        country.geography.geologicalFormations &&
        country.geography.geologicalFormations.length > 0
      ) {
        country.geography.geologicalFormations
          .slice(0, 2)
          .forEach((formation) => {
            content += `
            <div class="data-item">
              <span class="data-label">${formation.name}</span>
              <span>${formation.type} - ${formation.description}</span>
            </div>`;
          });
      }

      if (
        country.geography.majorWaterBodies &&
        country.geography.majorWaterBodies.length > 0
      ) {
        country.geography.majorWaterBodies.slice(0, 2).forEach((water) => {
          content += `
            <div class="data-item">
              <span class="data-label">${water.name}</span>
              <span>${water.type}${
            water.coastline ? ` - ${water.coastline}` : ""
          }${water.description ? ` - ${water.description}` : ""}</span>
            </div>`;
        });
      }
      content += `</div>`;
    }

    // Science & Technology
    if (country.scienceTechnology) {
      content += `
        <div class="data-section">
          <h4>🔬 Science & Technology</h4>`;

      if (country.scienceTechnology.patents) {
        content += `
          <div class="data-item">
            <span class="data-label">Patents</span>
            <span>${country.scienceTechnology.patents.toLocaleString()}</span>
          </div>`;
      }

      if (
        country.scienceTechnology.techStartups &&
        country.scienceTechnology.techStartups.length > 0
      ) {
        content += `
          <div class="data-item">
            <span class="data-label">Tech Companies</span>
            <span>${country.scienceTechnology.techStartups
              .slice(0, 4)
              .join(", ")}</span>
          </div>`;
      }

      if (
        country.scienceTechnology.spaceMissions &&
        country.scienceTechnology.spaceMissions.length > 0
      ) {
        const mission = country.scienceTechnology.spaceMissions[0];
        content += `
          <div class="data-item">
            <span class="data-label">Space Mission</span>
            <span>${mission.name} (${mission.year}) - ${mission.achievement}</span>
          </div>`;
      }

      if (
        country.scienceTechnology.breakthroughs &&
        country.scienceTechnology.breakthroughs.length > 0
      ) {
        const breakthrough = country.scienceTechnology.breakthroughs[0];
        content += `
          <div class="data-item">
            <span class="data-label">Innovation</span>
            <span>${breakthrough.invention} (${breakthrough.year}) by ${breakthrough.inventor}</span>
          </div>`;
      }
      content += `</div>`;
    }

    // Sports & Entertainment
    if (country.sportsEntertainment) {
      content += `
        <div class="data-section">
          <h4>🏆 Sports & Entertainment</h4>`;

      if (
        country.sportsEntertainment.nationalSports &&
        country.sportsEntertainment.nationalSports.length > 0
      ) {
        content += `
          <div class="data-item">
            <span class="data-label">National Sports</span>
            <span>${country.sportsEntertainment.nationalSports.join(
              ", "
            )}</span>
          </div>`;
      }

      if (country.sportsEntertainment.olympicPerformance) {
        const olympic = country.sportsEntertainment.olympicPerformance;
        content += `
          <div class="data-item">
            <span class="data-label">Olympic Medals</span>
            <span>Total: ${olympic.totalMedals} (🥇${olympic.goldMedals} 🥈${olympic.silverMedals} 🥉${olympic.bronzeMedals})</span>
          </div>`;
      }

      if (
        country.sportsEntertainment.musicArtists &&
        country.sportsEntertainment.musicArtists.length > 0
      ) {
        content += `
          <div class="data-item">
            <span class="data-label">Famous Artists</span>
            <span>${country.sportsEntertainment.musicArtists
              .slice(0, 3)
              .join(", ")}</span>
          </div>`;
      }

      if (
        country.sportsEntertainment.worldRecords &&
        country.sportsEntertainment.worldRecords.length > 0
      ) {
        const record = country.sportsEntertainment.worldRecords[0];
        content += `
          <div class="data-item">
            <span class="data-label">World Record</span>
            <span>${record.record}: ${record.value}</span>
          </div>`;
      }
      content += `</div>`;
    }

    // Famous Cities
    if (country.famousCities && country.famousCities.length > 0) {
      content += `
        <div class="data-section">
          <h4>🏙️ Famous Cities</h4>`;

      country.famousCities.slice(0, 4).forEach((city) => {
        content += `
          <div class="data-item">
            <span class="data-label">${city.name}</span>
            <span>${city.whyFamous}</span>
          </div>`;
      });
      content += `</div>`;
    }

    // Landmarks
    if (country.landmarks && country.landmarks.length > 0) {
      content += `
        <div class="data-section">
          <h4>🗿 Famous Landmarks</h4>`;

      country.landmarks.slice(0, 4).forEach((landmark) => {
        content += `
          <div class="data-item">
            <span class="data-label">${landmark.name}</span>
            <span>${landmark.city} - ${landmark.whyFamous}</span>
          </div>`;
      });
      content += `</div>`;
    }

    // Rivers
    if (country.rivers && country.rivers.length > 0) {
      content += `
        <div class="data-section">
          <h4>🌊 Major Rivers</h4>`;

      country.rivers.slice(0, 3).forEach((river) => {
        content += `
          <div class="data-item">
            <span class="data-label">${river.name}</span>
            <span>${river.length}km - ${river.source} to ${river.mouth}</span>
          </div>`;
      });
      content += `</div>`;
    }

    // Institutions
    if (country.institutions && country.institutions.length > 0) {
      content += `
        <div class="data-section">
          <h4>🎓 Top Institutions</h4>`;

      country.institutions.slice(0, 3).forEach((institution) => {
        content += `
          <div class="data-item">
            <span class="data-label">${institution.name}</span>
            <span>${institution.city} - Founded ${institution.founded} (Rank: ${institution.globalRank})</span>
          </div>`;
      });
      content += `</div>`;
    }

    // States/Provinces
    if (country.states && country.states.length > 0) {
      content += `
        <div class="data-section">
          <h4>🗺️ States/Provinces</h4>
          <div class="data-item">
            <span class="data-label">Total States/Provinces</span>
            <span>${country.states.length}</span>
          </div>`;

      country.states.slice(0, 6).forEach((state) => {
        content += `
          <div class="data-item">
            <span class="data-label">${state.name}</span>
            <span>Capital: ${state.capital}</span>
          </div>`;
      });

      if (country.states.length > 6) {
        content += `
          <div class="data-item">
            <span class="data-label">And More...</span>
            <span>${
              country.states.length - 6
            } additional states/provinces</span>
          </div>`;
      }
      content += `</div>`;
    }

    // Historical Timeline
    if (country.history && country.history.length > 0) {
      content += `
        <div class="data-section">
          <h4>📜 Historical Timeline</h4>`;

      country.history.slice(0, 5).forEach((event) => {
        content += `
          <div class="data-item">
            <span class="data-label">${event.year}</span>
            <span>${event.description}</span>
          </div>`;
      });
      content += `</div>`;
    }

    dataEl.innerHTML = content;
    panel.classList.remove("hidden");
  }

  update() {
    if (this.globeMesh) {
      this.globeMesh.rotation.y += 0.005;
    }

    // Animate markers
    this.countryMarkers.forEach((marker, index) => {
      const time = Date.now() * 0.001;
      const scale = 1 + Math.sin(time + index * 0.5) * 0.3;
      marker.scale.setScalar(scale);
    });
  }
}
