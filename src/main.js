import * as THREE from "three";
import { SimpleGlobe as Globe } from "./components/SimpleGlobe.js";
import { DataManager } from "./data/DataManager.js";
import { UIController } from "./ui/UIController.js";

class LivingGlobe {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.globe = null;
    this.dataManager = null;
    this.uiController = null;
    this.isLoading = true;

    this.init();
  }

  async init() {
    try {
      console.log("LivingGlobe: Starting initialization...");

      // Initialize Three.js scene
      this.initThreeJS();
      console.log("LivingGlobe: Three.js scene initialized");

      // Initialize data manager
      this.dataManager = new DataManager();
      await this.dataManager.loadInitialData();
      console.log("LivingGlobe: Data manager loaded");

      // Initialize globe
      console.log(
        "LivingGlobe: Creating globe with",
        this.dataManager.getCountries().length,
        "countries"
      );
      this.globe = new Globe(this.scene, this.dataManager);
      // Pass camera reference to the scene for raycasting
      this.scene.userData.camera = this.camera;

      console.log("LivingGlobe: About to initialize globe...");
      await this.globe.init();
      console.log("LivingGlobe: Globe initialized successfully");

      // Initialize UI controller
      this.uiController = new UIController(this.globe, this.dataManager);
      console.log("LivingGlobe: UI controller initialized");

      // Start render loop
      this.animate();
      console.log("LivingGlobe: Animation loop started");

      // Hide loading screen
      this.hideLoadingScreen();
      console.log(
        "LivingGlobe: Loading screen hidden - initialization complete!"
      );
    } catch (error) {
      console.error("Failed to initialize LivingGlobe:", error);
      console.error("Error stack:", error.stack);

      // Hide loading screen even on error
      this.hideLoadingScreen();

      // Show error message to user
      const loadingScreen = document.getElementById("loading-screen");
      if (loadingScreen) {
        loadingScreen.innerHTML = `
          <div class="loading-content">
            <h2>Error Loading LivingGlobe</h2>
            <p>Please check the console for details and refresh the page.</p>
            <p style="color: #ff6b6b; font-size: 14px;">${error.message}</p>
          </div>
        `;
        loadingScreen.style.display = "flex";
        loadingScreen.style.opacity = "1";
      }
    }
  }

  initThreeJS() {
    // Create scene
    this.scene = new THREE.Scene();

    // Create camera with better positioning
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 2.5);

    // Create renderer with basic settings to ensure visibility
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000011, 1); // Deep space color

    console.log("Renderer created successfully");

    // Add renderer to DOM
    const container = document.getElementById("globe-container");
    container.appendChild(this.renderer.domElement);

    // Add lights
    this.addLights();

    // Add basic camera controls
    this.initCameraControls();

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize());
  }

  addLights() {
    // Simple ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Main directional light
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(5, 3, 5);
    this.scene.add(sunLight);

    // Store sun light for reference
    this.sunLight = sunLight;

    console.log("Lights added to scene");
  }

  initCameraControls() {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraDistance = 2.5;

    const canvas = this.renderer.domElement;

    // Mouse controls for rotation
    canvas.addEventListener("mousedown", (event) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    canvas.addEventListener("mousemove", (event) => {
      // Always update globe mouse position for hover effects
      if (this.globe && this.globe.updateMousePosition) {
        this.globe.updateMousePosition(event);
      }

      if (!isDragging) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y,
      };

      // Rotate camera around the globe
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(this.camera.position);

      spherical.theta -= deltaMove.x * 0.01;
      spherical.phi += deltaMove.y * 0.01;

      // Limit vertical rotation
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      this.camera.position.setFromSpherical(spherical);
      this.camera.lookAt(0, 0, 0);

      previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    canvas.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Add click event for country selection
    canvas.addEventListener("click", (event) => {
      if (this.globe && this.globe.handleClick) {
        this.globe.handleClick();
      }
    });

    // Zoom with mouse wheel
    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();

      cameraDistance += event.deltaY * 0.001;
      cameraDistance = Math.max(1.5, Math.min(5, cameraDistance));

      const direction = this.camera.position.clone().normalize();
      this.camera.position.copy(direction.multiplyScalar(cameraDistance));
    });

    // Touch controls for mobile
    let touchStart = null;

    canvas.addEventListener("touchstart", (event) => {
      if (event.touches.length === 1) {
        touchStart = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }
    });

    canvas.addEventListener("touchmove", (event) => {
      if (!touchStart || event.touches.length !== 1) return;

      event.preventDefault();

      const deltaMove = {
        x: event.touches[0].clientX - touchStart.x,
        y: event.touches[0].clientY - touchStart.y,
      };

      const spherical = new THREE.Spherical();
      spherical.setFromVector3(this.camera.position);

      spherical.theta -= deltaMove.x * 0.01;
      spherical.phi += deltaMove.y * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      this.camera.position.setFromSpherical(spherical);
      this.camera.lookAt(0, 0, 0);

      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    });

    canvas.addEventListener("touchend", () => {
      touchStart = null;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Update globe
    if (this.globe) {
      this.globe.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateDynamicLighting() {
    const time = Date.now() * 0.001;

    // Animate sun light position for realistic day/night cycle
    if (this.sunLight) {
      const sunAngle = time * 0.1;
      this.sunLight.position.x = Math.cos(sunAngle) * 5;
      this.sunLight.position.z = Math.sin(sunAngle) * 5;
      this.sunLight.position.y = Math.sin(sunAngle * 0.5) * 3 + 2;
    }

    // Animate atmospheric lights
    if (this.atmosphereLights) {
      this.atmosphereLights.forEach((light, index) => {
        const phase = time + index * Math.PI;
        light.intensity = 0.4 + Math.sin(phase) * 0.2;

        // Subtle position animation
        const radius = 4 + Math.sin(phase * 0.5) * 0.5;
        const angle = phase * 0.3;
        light.position.x = Math.cos(angle) * radius;
        light.position.z = Math.sin(angle) * radius;
      });
    }

    // Animate rim light
    if (this.rimLight) {
      this.rimLight.intensity = 1.0 + Math.sin(time * 2) * 0.2;
    }
  }

  updateCameraEffects() {
    // Update atmosphere shader uniforms if globe has atmosphere
    if (this.globe && this.globe.atmosphereMesh) {
      const atmosphereMaterial = this.globe.atmosphereMesh.material;
      if (
        atmosphereMaterial.uniforms &&
        atmosphereMaterial.uniforms.viewVector
      ) {
        atmosphereMaterial.uniforms.viewVector.value = this.camera.position
          .clone()
          .normalize();
      }
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById("loading-screen");
    loadingScreen.style.opacity = "0";
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  }
}

// Handle development popup
function initDevPopup() {
  const devPopup = document.getElementById("dev-popup");
  const continueBtn = document.getElementById("continue-btn");

  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      devPopup.classList.add("hidden");
      setTimeout(() => {
        devPopup.style.display = "none";
      }, 500);
    });
  }

  // Auto-hide after 10 seconds if user doesn't interact
  setTimeout(() => {
    if (devPopup && !devPopup.classList.contains("hidden")) {
      devPopup.classList.add("hidden");
      setTimeout(() => {
        devPopup.style.display = "none";
      }, 500);
    }
  }, 10000);
}

// Initialize development popup
initDevPopup();

// Initialize the application
new LivingGlobe();
