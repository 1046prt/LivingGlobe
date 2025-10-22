import * as THREE from "three";
import * as d3 from "d3";
import { CountryInfoDisplay } from "./CountryInfoDisplay.js";

export class Globe {
  constructor(scene, dataManager) {
    this.scene = scene;
    this.dataManager = dataManager;
    this.globeMesh = null;
    this.atmosphereMesh = null;
    this.countryMeshes = [];
    this.dataPoints = [];
    this.isRotating = true;
    this.rotationSpeed = 0.002;
    this.currentMode = "population";
    this.isDayMode = true;

    // Mouse interaction
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.hoveredCountry = null;

    this.initMouseEvents();
  }

  async init() {
    try {
      console.log("LivingGlobe: Initializing globe...");
      await this.createGlobe();
      console.log("LivingGlobe: Globe created");

      this.createAtmosphere();
      console.log("LivingGlobe: Atmosphere created");

      await this.createCountries();
      console.log("LivingGlobe: Countries created:", this.countryMeshes.length);

      this.updateDataVisualization();
      console.log("LivingGlobe: Globe initialization complete");
    } catch (error) {
      console.error("LivingGlobe: Error during globe initialization:", error);
      throw error;
    }
  }

  async createGlobe() {
    try {
      console.log("LivingGlobe: Creating sphere geometry...");
      const geometry = new THREE.SphereGeometry(1, 64, 64);

      console.log("LivingGlobe: Creating textures...");
      // Create realistic Earth textures
      const earthTexture = this.createEarthTexture();
      console.log("LivingGlobe: Earth texture created");

      const bumpTexture = this.createBumpTexture();
      console.log("LivingGlobe: Bump texture created");

      const specularTexture = this.createSpecularTexture();
      console.log("LivingGlobe: Specular texture created");

      const nightTexture = this.createNightTexture();
      console.log("LivingGlobe: Night texture created");

      console.log("LivingGlobe: Creating material...");
      const material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: bumpTexture,
        bumpScale: 0.02,
        specularMap: specularTexture,
        specular: new THREE.Color(0x222222),
        shininess: 25,
        transparent: false,
      });

      console.log("LivingGlobe: Creating mesh...");
      this.globeMesh = new THREE.Mesh(geometry, material);
      this.globeMesh.receiveShadow = true;
      this.globeMesh.castShadow = true;

      // Store textures for mode switching
      this.nightTexture = nightTexture;
      this.dayTexture = earthTexture;

      console.log("LivingGlobe: Adding globe to scene...");
      this.scene.add(this.globeMesh);

      console.log("LivingGlobe: Creating clouds...");
      // Add clouds layer
      this.createClouds();
      console.log("LivingGlobe: Globe creation complete");
    } catch (error) {
      console.error("LivingGlobe: Error in createGlobe:", error);
      throw error;
    }
  }

  createEarthTexture() {
    try {
      console.log("LivingGlobe: Creating earth texture canvas...");
      const canvas = document.createElement("canvas");
      canvas.width = 1024; // Reduced size for better performance
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get 2D context from canvas");
      }

      // Create ocean base
      const oceanGradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      oceanGradient.addColorStop(0, "#1e3a8a");
      oceanGradient.addColorStop(0.5, "#1e40af");
      oceanGradient.addColorStop(1, "#1e3a8a");

      ctx.fillStyle = oceanGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add realistic continents
      this.drawContinents(ctx, canvas.width, canvas.height);
      console.log("LivingGlobe: Earth texture canvas completed");
      return new THREE.CanvasTexture(canvas);
    } catch (error) {
      console.error("LivingGlobe: Error creating earth texture:", error);
      // Return a simple blue texture as fallback
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#4a90e2";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return new THREE.CanvasTexture(canvas);
    }
  }

  drawContinents(ctx, width, height) {
    // North America
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.ellipse(
      width * 0.2,
      height * 0.3,
      width * 0.08,
      height * 0.12,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // South America
    ctx.beginPath();
    ctx.ellipse(
      width * 0.25,
      height * 0.65,
      width * 0.04,
      height * 0.15,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Europe
    ctx.fillStyle = "#16a34a";
    ctx.beginPath();
    ctx.ellipse(
      width * 0.52,
      height * 0.25,
      width * 0.03,
      height * 0.06,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Africa
    ctx.fillStyle = "#15803d";
    ctx.beginPath();
    ctx.ellipse(
      width * 0.53,
      height * 0.5,
      width * 0.05,
      height * 0.2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Asia
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.ellipse(
      width * 0.7,
      height * 0.3,
      width * 0.12,
      height * 0.15,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Australia
    ctx.fillStyle = "#16a34a";
    ctx.beginPath();
    ctx.ellipse(
      width * 0.8,
      height * 0.7,
      width * 0.04,
      height * 0.06,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Add some islands and details
    ctx.fillStyle = "#15803d";
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 10 + 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  createBumpTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Create noise for terrain
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise; // Red
      data[i + 1] = noise; // Green
      data[i + 2] = noise; // Blue
      data[i + 3] = 255; // Alpha
    }

    ctx.putImageData(imageData, 0, 0);
    return new THREE.CanvasTexture(canvas);
  }

  createSpecularTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Ocean areas should be more reflective (white)
    // Land areas should be less reflective (black)
    ctx.fillStyle = "#ffffff"; // Ocean reflection
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Make land areas less reflective
    ctx.fillStyle = "#333333";
    ctx.globalCompositeOperation = "multiply";

    // Rough continent shapes for specular mapping
    ctx.beginPath();
    ctx.ellipse(
      canvas.width * 0.2,
      canvas.height * 0.3,
      canvas.width * 0.08,
      canvas.height * 0.12,
      0,
      0,
      Math.PI * 2
    );
    ctx.ellipse(
      canvas.width * 0.25,
      canvas.height * 0.65,
      canvas.width * 0.04,
      canvas.height * 0.15,
      0,
      0,
      Math.PI * 2
    );
    ctx.ellipse(
      canvas.width * 0.52,
      canvas.height * 0.25,
      canvas.width * 0.03,
      canvas.height * 0.06,
      0,
      0,
      Math.PI * 2
    );
    ctx.ellipse(
      canvas.width * 0.53,
      canvas.height * 0.5,
      canvas.width * 0.05,
      canvas.height * 0.2,
      0,
      0,
      Math.PI * 2
    );
    ctx.ellipse(
      canvas.width * 0.7,
      canvas.height * 0.3,
      canvas.width * 0.12,
      canvas.height * 0.15,
      0,
      0,
      Math.PI * 2
    );
    ctx.ellipse(
      canvas.width * 0.8,
      canvas.height * 0.7,
      canvas.width * 0.04,
      canvas.height * 0.06,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  createNightTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Dark base
    ctx.fillStyle = "#000011";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add city lights
    ctx.fillStyle = "#ffff88";
    ctx.shadowColor = "#ffff88";
    ctx.shadowBlur = 3;

    // Major city light clusters
    const cities = [
      { x: 0.2, y: 0.35, size: 3 }, // New York
      { x: 0.25, y: 0.6, size: 2 }, // São Paulo
      { x: 0.52, y: 0.28, size: 2 }, // London
      { x: 0.55, y: 0.45, size: 1 }, // Cairo
      { x: 0.72, y: 0.32, size: 3 }, // Tokyo
      { x: 0.68, y: 0.38, size: 2 }, // Beijing
      { x: 0.7, y: 0.42, size: 2 }, // Mumbai
      { x: 0.8, y: 0.68, size: 1 }, // Sydney
    ];

    cities.forEach((city) => {
      const x = city.x * canvas.width;
      const y = city.y * canvas.height;

      // Main city glow
      ctx.beginPath();
      ctx.arc(x, y, city.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Surrounding lights
      for (let i = 0; i < 20; i++) {
        const offsetX = (Math.random() - 0.5) * 50;
        const offsetY = (Math.random() - 0.5) * 30;
        ctx.beginPath();
        ctx.arc(
          x + offsetX,
          y + offsetY,
          Math.random() * 2 + 0.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });

    return new THREE.CanvasTexture(canvas);
  }

  createClouds() {
    const geometry = new THREE.SphereGeometry(1.005, 64, 64);
    const cloudTexture = this.createCloudTexture();

    const material = new THREE.MeshLambertMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.4,
    });

    this.cloudsMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.cloudsMesh);
  }

  createCloudTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Transparent base
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create cloud patterns
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 40 + 10;
      const opacity = Math.random() * 0.6 + 0.2;

      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    return new THREE.CanvasTexture(canvas);
  }

  createAtmosphere() {
    const geometry = new THREE.SphereGeometry(1.02, 32, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
      fragmentShader: `
                uniform float time;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    vec3 atmosphere = vec3(0.3, 0.6, 1.0) * intensity;
                    gl_FragColor = vec4(atmosphere, intensity * 0.8);
                }
            `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });

    this.atmosphereMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.atmosphereMesh);
  }

  async createCountries() {
    const countries = this.dataManager.getCountries();

    countries.forEach((country) => {
      // Use real coordinates from country data
      const lat = country.lat || 0;
      const lon = country.lon || 0;

      const position = this.latLonToVector3(lat, lon, 1.015);

      // Create a more sophisticated country marker
      const geometry = new THREE.ConeGeometry(0.015, 0.04, 8);
      const material = new THREE.MeshPhongMaterial({
        color: this.getCountryColor(country, this.currentMode),
        transparent: true,
        opacity: 0.9,
        emissive: this.getCountryColor(country, this.currentMode),
        emissiveIntensity: 0.2,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);

      // Point the cone outward from the globe center
      mesh.lookAt(position.clone().multiplyScalar(2));

      mesh.userData = { country, lat, lon };

      this.countryMeshes.push(mesh);
      this.globeMesh.add(mesh);

      // Add a subtle glow ring around major countries
      if (country.population > 100000000) {
        this.createCountryGlow(position, country);
      }
    });
  }

  createCountryGlow(position, country) {
    const geometry = new THREE.RingGeometry(0.03, 0.05, 16);
    const material = new THREE.MeshBasicMaterial({
      color: this.getCountryColor(country, this.currentMode),
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });

    const ring = new THREE.Mesh(geometry, material);
    ring.position.copy(position);
    ring.lookAt(position.clone().multiplyScalar(2));

    this.countryMeshes.push(ring);
    this.globeMesh.add(ring);
  }

  latLonToVector3(lat, lon, radius = 1) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  getCountryColor(country, mode) {
    const colorScale = d3.scaleSequential(d3.interpolateViridis);

    switch (mode) {
      case "population":
        const popValue = (country.population || 0) / 1000000000; // Normalize to billions
        return new THREE.Color(colorScale(Math.min(popValue, 1)));
      case "gdp":
        const gdpValue = (country.gdp || 0) / 20000000000000; // Normalize to trillions
        return new THREE.Color(colorScale(Math.min(gdpValue, 1)));
      case "environment":
        return new THREE.Color(0x00ff00);
      case "culture":
        return new THREE.Color(0xff6b6b);
      default:
        return new THREE.Color(0x00d4ff);
    }
  }

  updateDataVisualization(mode = this.currentMode) {
    this.currentMode = mode;

    this.countryMeshes.forEach((mesh) => {
      const country = mesh.userData.country;
      mesh.material.color = this.getCountryColor(country, mode);
    });
  }

  initMouseEvents() {
    const canvas = document.querySelector("canvas");

    canvas.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.handleMouseMove();
    });

    canvas.addEventListener("click", (event) => {
      this.handleClick();
    });
  }

  handleMouseMove() {
    // Get camera from the scene (passed from main app)
    const camera = this.scene.userData.camera;
    if (!camera) return;

    this.raycaster.setFromCamera(this.mouse, camera);
    const intersects = this.raycaster.intersectObjects(this.countryMeshes);

    if (intersects.length > 0) {
      const country = intersects[0].object.userData.country;

      if (this.hoveredCountry !== country) {
        this.hoveredCountry = country;
        this.showTooltip(country);
      }
    } else {
      if (this.hoveredCountry) {
        this.hoveredCountry = null;
        this.hideTooltip();
      }
    }
  }

  handleClick() {
    if (this.hoveredCountry) {
      CountryInfoDisplay.show(this.hoveredCountry);
    }
  }

  showTooltip(country) {
    const tooltip = document.getElementById("tooltip");
    const content = document.querySelector(".tooltip-content");

    content.innerHTML = `
            <strong>${country.name}</strong><br>
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
    tooltip.classList.add("hidden");
  }

  showCountryInfo(country) {
    const panel = document.getElementById("info-panel");
    const nameEl = document.getElementById("country-name");
    const dataEl = document.getElementById("country-data");
    const flagEl = document.getElementById("country-flag");

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

    nameEl.innerHTML = `${country.flag || "🌍"} ${country.name}`;
    dataEl.innerHTML = `
            <div class="data-item">
                <span class="data-label">Population</span>
                ${(country.population || 0).toLocaleString()}
            </div>
            <div class="data-item">
                <span class="data-label">Capital</span>
                ${country.capital || "N/A"}
            </div>
            <div class="data-item">
                <span class="data-label">GDP</span>
                $${((country.gdp || 0) / 1000000000).toFixed(2)}B
            </div>
            <div class="data-item">
                <span class="data-label">Region</span>
                ${country.region || "N/A"}
            </div>
        `;

    panel.classList.remove("hidden");
  }

  setViewMode(isDayMode) {
    this.isDayMode = isDayMode;

    if (isDayMode) {
      this.globeMesh.material.map = this.dayTexture;
      this.globeMesh.material.emissive = new THREE.Color(0x000000);
      this.globeMesh.material.emissiveIntensity = 0;

      // Show clouds in day mode
      if (this.cloudsMesh) {
        this.cloudsMesh.visible = true;
      }
    } else {
      this.globeMesh.material.map = this.nightTexture;
      this.globeMesh.material.emissive = new THREE.Color(0x112244);
      this.globeMesh.material.emissiveIntensity = 0.1;

      // Hide clouds in night mode to see city lights better
      if (this.cloudsMesh) {
        this.cloudsMesh.visible = false;
      }
    }

    this.globeMesh.material.needsUpdate = true;
  }

  update() {
    if (this.isRotating && this.globeMesh) {
      this.globeMesh.rotation.y += this.rotationSpeed;

      // Rotate clouds slightly slower for realistic effect
      if (this.cloudsMesh) {
        this.cloudsMesh.rotation.y += this.rotationSpeed * 0.8;
      }
    }

    if (this.atmosphereMesh) {
      this.atmosphereMesh.material.uniforms.time.value += 0.01;
      // Slowly rotate atmosphere for dynamic effect
      this.atmosphereMesh.rotation.y += this.rotationSpeed * 0.1;
    }

    // Animate data points with more sophisticated effects
    this.countryMeshes.forEach((mesh, index) => {
      const time = Date.now() * 0.001;

      // Different animation for cone markers vs rings
      if (mesh.geometry.type === "ConeGeometry") {
        const scale = 1 + Math.sin(time + index * 0.1) * 0.3;
        mesh.scale.setScalar(scale);

        // Add subtle color pulsing for active countries
        const country = mesh.userData?.country;
        if (country && country.population > 50000000) {
          const intensity = 0.2 + Math.sin(time * 2 + index * 0.2) * 0.1;
          mesh.material.emissiveIntensity = intensity;
        }
      } else if (mesh.geometry.type === "RingGeometry") {
        // Rings pulse differently
        const scale = 1 + Math.sin(time * 1.5 + index * 0.15) * 0.4;
        mesh.scale.setScalar(scale);

        const opacity = 0.3 + Math.sin(time * 2 + index * 0.1) * 0.2;
        mesh.material.opacity = Math.max(0.1, opacity);
      }
    });
  }
}
