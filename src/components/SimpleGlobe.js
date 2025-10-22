import * as THREE from "three";

export class SimpleGlobe {
  constructor(scene, dataManager) {
    this.scene = scene;
    this.dataManager = dataManager;
    this.globeMesh = null;
    this.atmosphereMesh = null;
    this.cloudsMesh = null;
    this.countryMarkers = [];
    this.isRotating = true;
    this.rotationSpeed = 0.002;

    // Mouse interaction
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.hoveredCountry = null;

    // Animation properties
    this.time = 0;
    this.pulsePhase = 0;

    this.initMouseEvents();
  }

  async init() {
    console.log("SimpleGlobe: Creating realistic globe...");

    await this.createRealisticEarth();
    this.createAtmosphere();
    this.createClouds();
    this.createStarField();
    this.createSimpleCountries();

    console.log("SimpleGlobe: Realistic globe created successfully");
  }

  async createRealisticEarth() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);

    // Create simple Earth material - start with basic color to ensure visibility
    const material = new THREE.MeshPhongMaterial({
      color: 0x2a5f7f, // Ocean blue
      shininess: 30,
    });

    this.globeMesh = new THREE.Mesh(geometry, material);
    this.globeMesh.receiveShadow = true;
    this.globeMesh.castShadow = true;
    this.scene.add(this.globeMesh);

    console.log("Globe mesh created and added to scene");
  }

  createEarthDayTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Create realistic Earth colors - minimal and natural
    ctx.fillStyle = "#1a4d66"; // Deep ocean blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add realistic continent shapes with natural colors
    const continents = [
      { x: 150, y: 200, w: 200, h: 150, color: "#2d5016" }, // Dark green land
      { x: 400, y: 180, w: 180, h: 120, color: "#3d4a2e" }, // Forest green
      { x: 650, y: 220, w: 160, h: 100, color: "#4a5d23" }, // Land green
      { x: 200, y: 350, w: 140, h: 80, color: "#2d5016" }, // More land
      { x: 500, y: 320, w: 120, h: 90, color: "#3d4a2e" }, // More forest
      { x: 750, y: 300, w: 100, h: 70, color: "#4a5d23" }, // More land
    ];

    continents.forEach((continent) => {
      ctx.fillStyle = continent.color;
      ctx.beginPath();
      ctx.ellipse(
        continent.x,
        continent.y,
        continent.w / 2,
        continent.h / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Add some subtle terrain variation
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 40 + 20;
      ctx.fillStyle = `rgba(45, 80, 22, ${Math.random() * 0.3 + 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  createEarthNightTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Dark base
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle, realistic city lights - fewer and more natural
    ctx.fillStyle = "#ffcc66";
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2 + 0.5;
      const opacity = Math.random() * 0.8 + 0.2;

      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    return new THREE.CanvasTexture(canvas);
  }

  createEarthNormalMap() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // Create noise for surface details
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.random() * 0.5 + 0.5;
      imageData.data[i] = noise * 255; // R
      imageData.data[i + 1] = noise * 255; // G
      imageData.data[i + 2] = 255; // B
      imageData.data[i + 3] = 255; // A
    }
    ctx.putImageData(imageData, 0, 0);

    return new THREE.CanvasTexture(canvas);
  }

  createEarthSpecularMap() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // Water areas are more specular
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add specular water areas
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const width = Math.random() * 200 + 100;
      const height = Math.random() * 100 + 50;
      ctx.fillRect(x, y, width, height);
    }

    return new THREE.CanvasTexture(canvas);
  }

  createAtmosphere() {
    const atmosphereGeometry = new THREE.SphereGeometry(1.02, 16, 16);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    });

    this.atmosphereMesh = new THREE.Mesh(
      atmosphereGeometry,
      atmosphereMaterial
    );
    this.scene.add(this.atmosphereMesh);
  }

  createClouds() {
    const cloudGeometry = new THREE.SphereGeometry(1.005, 16, 16);
    const cloudMaterial = new THREE.MeshBasicMaterial({
      map: this.createCloudTexture(),
      transparent: true,
      opacity: 0.3,
    });

    this.cloudsMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    this.scene.add(this.cloudsMesh);
  }

  createCloudTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Create cloud noise
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add cloud formations
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 50 + 20;
      const opacity = Math.random() * 0.8 + 0.2;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  createStarField() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.8,
    });

    const starsVertices = [];
    // Fewer stars for a more realistic look
    for (let i = 0; i < 2000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(starField);
  }

  createCountryLabel(countryName, x, y, z) {
    // Create a larger canvas for better text quality
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 100;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Create clean background with subtle styling
    context.fillStyle = "rgba(255, 255, 255, 0.95)";
    context.beginPath();
    if (context.roundRect) {
      context.roundRect(6, 6, canvas.width - 12, canvas.height - 12, 12);
    } else {
      context.rect(6, 6, canvas.width - 12, canvas.height - 12);
    }
    context.fill();

    // Add subtle border
    context.strokeStyle = "rgba(0, 0, 0, 0.2)";
    context.lineWidth = 2;
    context.stroke();

    // Style the text - larger and bolder
    context.font = "bold 24px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw text outline for better contrast
    context.strokeStyle = "#ffffff";
    context.lineWidth = 4;
    context.strokeText(countryName, centerX, centerY);

    // Draw the main text - dark and bold
    context.fillStyle = "#1a1a1a";
    context.fillText(countryName, centerX, centerY);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Create sprite material with better settings
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      alphaTest: 0.1,
    });

    // Create sprite
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x * 1.15, y * 1.15, z * 1.15);
    sprite.scale.set(0.5, 0.15, 1); // Larger scale for better visibility

    // Store label data for updates
    sprite.userData = {
      isLabel: true,
      countryName: countryName,
      originalPosition: new THREE.Vector3(x * 1.15, y * 1.15, z * 1.15),
    };

    this.scene.add(sprite);
  }

  createSimpleCountries() {
    const countries = this.dataManager.getCountries();
    console.log(
      "SimpleGlobe: Creating enhanced markers for",
      countries.length,
      "countries"
    );

    countries.forEach((country, index) => {
      const lat = country.lat || 0;
      const lon = country.lon || 0;

      // Convert lat/lon to 3D position
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const radius = 1.06;

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      // Create enhanced marker with glow effect
      const populationScale =
        Math.log(country.population || 1000000) / Math.log(1000000000);
      const markerSize = Math.max(
        0.012,
        Math.min(0.025, 0.012 + populationScale * 0.015)
      );

      // Create marker group for complex effects
      const markerGroup = new THREE.Group();

      // Main marker sphere - simple and minimal
      const markerGeometry = new THREE.SphereGeometry(markerSize, 12, 12);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
      });

      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      markerGroup.add(marker);

      // Simple ring indicator - minimal design
      const ringGeometry = new THREE.RingGeometry(
        markerSize * 1.2,
        markerSize * 1.5,
        8
      );
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      });

      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.lookAt(0, 0, 0); // Face the center
      markerGroup.add(ring);

      markerGroup.position.set(x, y, z);
      markerGroup.userData = {
        country,
        originalPosition: new THREE.Vector3(x, y, z),
        pulsePhase: Math.random() * Math.PI * 2,
        marker: marker,
        ring: ring,
      };

      this.countryMarkers.push(markerGroup);
      this.scene.add(markerGroup);

      // Add enhanced country name label
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

    // Create array of all marker meshes for raycasting
    const markerMeshes = [];
    this.countryMarkers.forEach((markerGroup) => {
      if (markerGroup.userData.marker) {
        markerMeshes.push(markerGroup.userData.marker);
      }
    });

    const intersects = this.raycaster.intersectObjects(markerMeshes);

    if (intersects.length > 0) {
      // Find the parent group
      const intersectedMesh = intersects[0].object;
      const markerGroup = this.countryMarkers.find(
        (group) => group.userData.marker === intersectedMesh
      );

      if (markerGroup) {
        const country = markerGroup.userData.country;

        if (this.hoveredCountry !== country) {
          // Reset previous hover state
          if (this.hoveredCountry) {
            this.resetMarkerState(this.hoveredCountry);
          }

          this.hoveredCountry = country;
          this.showTooltip(country);

          // Highlight the marker with enhanced effects
          this.highlightMarker(markerGroup);
        }
      }
    } else {
      if (this.hoveredCountry) {
        this.resetMarkerState(this.hoveredCountry);
        this.hoveredCountry = null;
        this.hideTooltip();
      }
    }
  }

  highlightMarker(markerGroup) {
    const marker = markerGroup.userData.marker;
    const ring = markerGroup.userData.ring;

    // Simple color change for highlight
    marker.material.color.setHex(0x66ccff);
    marker.material.opacity = 1.0;

    ring.material.color.setHex(0x66ccff);
    ring.material.opacity = 0.7;

    // Subtle scale animation
    markerGroup.scale.setScalar(1.3);
  }

  resetMarkerState(country) {
    const markerGroup = this.countryMarkers.find(
      (group) => group.userData.country === country
    );

    if (markerGroup) {
      const marker = markerGroup.userData.marker;
      const ring = markerGroup.userData.ring;

      // Reset to default colors
      marker.material.color.setHex(0xffffff);
      marker.material.opacity = 0.8;

      ring.material.color.setHex(0xcccccc);
      ring.material.opacity = 0.4;

      // Reset scale
      markerGroup.scale.setScalar(1.0);
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
    const flagEl = document.getElementById("country-flag");

    if (!panel || !nameEl || !dataEl) return;

    // Show country flag image
    if (flagEl && country.iso2) {
      const flagCode = country.iso2.toLowerCase();
      const flagPath =
        flagCode === "jp"
          ? `/src/data/flags/${flagCode}.jpg`
          : `/src/data/flags/${flagCode}.png`;

      flagEl.innerHTML = `<img src="${flagPath}" alt="${country.name} flag" onerror="this.style.display='none'">`;
      flagEl.classList.remove("hidden");
    } else if (flagEl) {
      flagEl.classList.add("hidden");
    }

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
    this.time += 0.016; // Assuming 60fps

    // Rotate globe naturally
    if (this.isRotating && this.globeMesh) {
      this.globeMesh.rotation.y += this.rotationSpeed;
    }

    // Update atmosphere rotation
    if (this.atmosphereMesh) {
      this.atmosphereMesh.rotation.y += this.rotationSpeed * 0.5;
    }

    // Update clouds rotation
    if (this.cloudsMesh) {
      this.cloudsMesh.rotation.y += this.rotationSpeed * 1.2; // Clouds move slightly faster
    }

    // Animate markers with subtle effects
    this.countryMarkers.forEach((markerGroup, index) => {
      const userData = markerGroup.userData;

      // Very subtle floating animation
      const floatOffset =
        Math.sin(this.time * 1.5 + userData.pulsePhase) * 0.001;
      const originalPos = userData.originalPosition;
      const direction = originalPos.clone().normalize();
      markerGroup.position.copy(
        originalPos.clone().add(direction.multiplyScalar(floatOffset))
      );

      // Rotate markers to always face outward
      markerGroup.lookAt(
        markerGroup.position.x * 2,
        markerGroup.position.y * 2,
        markerGroup.position.z * 2
      );
    });

    // Update country labels to always face camera
    this.updateCountryLabels();
  }

  updateCountryLabels() {
    // Get camera from scene
    const camera = this.scene.userData.camera;
    if (!camera) return;

    // Update all label sprites to face the camera
    this.scene.traverse((child) => {
      if (child.userData && child.userData.isLabel) {
        // Make label face camera
        child.lookAt(camera.position);

        // Calculate distance-based scaling
        const distance = camera.position.distanceTo(child.position);
        const scale = Math.max(0.3, Math.min(0.8, 3.0 / distance));
        child.scale.set(scale * 0.5, scale * 0.15, 1);

        // Fade labels based on angle to camera
        const cameraDirection = camera.position.clone().normalize();
        const labelDirection = child.userData.originalPosition
          .clone()
          .normalize();
        const dot = cameraDirection.dot(labelDirection);

        // Only show labels on the visible side of the globe
        if (dot > -0.1) {
          child.material.opacity = Math.max(
            0.4,
            Math.min(0.9, (dot + 0.1) * 1.5)
          );
          child.visible = true;
        } else {
          child.visible = false;
        }
      }
    });
  }

  setViewMode(isDayMode) {
    // Update atmosphere color for day/night mode
    if (this.atmosphereMesh) {
      const atmosphereColor = isDayMode
        ? new THREE.Color(0x87ceeb)
        : new THREE.Color(0x1a1a2e);

      this.atmosphereMesh.material.color = atmosphereColor;
    }

    // Update rotation speed for different modes
    this.rotationSpeed = isDayMode ? 0.002 : 0.001;
  }

  updateDataVisualization(mode) {
    // Update marker colors based on data mode - minimal color scheme
    const data = this.dataManager.getDataForVisualization(mode);

    this.countryMarkers.forEach((markerGroup) => {
      const country = markerGroup.userData.country;
      const countryData = data.find((d) => d.country === country.name);

      if (countryData && markerGroup.userData.marker) {
        const marker = markerGroup.userData.marker;
        const intensity = countryData.normalized;

        // Simple, minimal color scheme based on data mode
        let color;
        switch (mode) {
          case "population":
            // Blue tones for population
            color = new THREE.Color().setHSL(0.6, 0.5, 0.4 + intensity * 0.4);
            break;
          case "gdp":
            // Green tones for GDP
            color = new THREE.Color().setHSL(0.3, 0.5, 0.4 + intensity * 0.4);
            break;
          case "environment":
            // Green tones for environment
            color = new THREE.Color().setHSL(0.25, 0.4, 0.4 + intensity * 0.3);
            break;
          case "culture":
            // Purple tones for culture
            color = new THREE.Color().setHSL(0.8, 0.4, 0.4 + intensity * 0.3);
            break;
          default:
            color = new THREE.Color(0xffffff);
        }

        marker.material.color = color;
        marker.material.opacity = 0.6 + intensity * 0.4;
      }
    });
  }
}
