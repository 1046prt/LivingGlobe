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
      if (index < 20) {
        // Show first 20 countries
        const lat = country.lat || 0;
        const lon = country.lon || 0;

        // Convert lat/lon to 3D position
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const radius = 1.05;

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);

        // Create a simple marker
        const markerGeometry = new THREE.SphereGeometry(0.02, 8, 8);
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
      }
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

    nameEl.innerHTML = `${country.flag || "🌍"} ${country.name}`;
    dataEl.innerHTML = `
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
      </div>

      <div class="data-section">
        <h4>Economic Data</h4>
        <div class="data-item">
          <span class="data-label">GDP</span>
          <span>$${((country.gdp || 0) / 1000000000).toFixed(2)}B</span>
        </div>
        <div class="data-item">
          <span class="data-label">GDP per Capita</span>
          <span>$${(country.gdpPerCapita || 0).toLocaleString()}</span>
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
      </div>
    `;

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
