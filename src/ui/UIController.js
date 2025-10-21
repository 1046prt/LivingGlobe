export class UIController {
  constructor(globe, dataManager) {
    this.globe = globe;
    this.dataManager = dataManager;
    this.currentMode = "population";
    this.isNightMode = false;

    this.initEventListeners();
  }

  initEventListeners() {
    // Data layer buttons
    const dataButtons = document.querySelectorAll("[data-mode]");
    dataButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const mode = e.target.dataset.mode;
        this.switchDataMode(mode);
      });
    });

    // View mode buttons
    const viewButtons = document.querySelectorAll("[data-view]");
    viewButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const view = e.target.dataset.view;
        this.switchViewMode(view);
      });
    });

    // Close info panel
    const closeBtn = document.getElementById("close-info");
    closeBtn.addEventListener("click", () => {
      this.hideInfoPanel();
    });

    // Help modal controls
    const helpButton = document.getElementById("help-button");
    const helpModal = document.getElementById("help-modal");
    const closeHelpBtn = document.getElementById("close-help");

    if (helpButton) {
      helpButton.addEventListener("click", () => {
        this.showHelpModal();
      });
    }

    if (closeHelpBtn) {
      closeHelpBtn.addEventListener("click", () => {
        this.hideHelpModal();
      });
    }

    // Close help modal when clicking outside
    if (helpModal) {
      helpModal.addEventListener("click", (e) => {
        if (e.target === helpModal) {
          this.hideHelpModal();
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      this.handleKeyboard(e);
    });

    // Mouse wheel for zoom (if implementing camera controls)
    document.addEventListener("wheel", (e) => {
      this.handleZoom(e);
    });
  }

  switchDataMode(mode) {
    if (this.currentMode === mode) return;

    this.currentMode = mode;

    // Update button states
    document.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add("active");

    // Update globe visualization
    this.globe.updateDataVisualization(mode);

    // Add visual feedback
    this.showModeChangeNotification(mode);
  }

  switchViewMode(view) {
    const isDayMode = view === "day";
    this.isNightMode = !isDayMode;

    // Update button states
    document.querySelectorAll("[data-view]").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-view="${view}"]`).classList.add("active");

    // Update globe view
    this.globe.setViewMode(isDayMode);

    // Update UI theme
    this.updateUITheme(isDayMode);
  }

  updateUITheme(isDayMode) {
    const body = document.body;

    if (isDayMode) {
      body.style.background =
        "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)";
    } else {
      body.style.background =
        "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #1a1a1a 100%)";
    }
  }

  showModeChangeNotification(mode) {
    // Create temporary notification
    const notification = document.createElement("div");
    notification.className = "mode-notification";
    notification.textContent = `Switched to ${
      mode.charAt(0).toUpperCase() + mode.slice(1)
    } mode`;

    // Style the notification
    Object.assign(notification.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "rgba(0, 212, 255, 0.9)",
      color: "white",
      padding: "15px 25px",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "bold",
      zIndex: "1000",
      opacity: "0",
      transition: "opacity 0.3s ease",
    });

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = "1";
    }, 10);

    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }

  hideInfoPanel() {
    const panel = document.getElementById("info-panel");
    panel.classList.add("hidden");
  }

  showHelpModal() {
    const modal = document.getElementById("help-modal");
    if (modal) {
      modal.classList.remove("hidden");
      // Add some animation delay
      setTimeout(() => {
        modal.style.opacity = "1";
      }, 10);
    }
  }

  hideHelpModal() {
    const modal = document.getElementById("help-modal");
    if (modal) {
      modal.style.opacity = "0";
      setTimeout(() => {
        modal.classList.add("hidden");
      }, 300);
    }
  }

  handleKeyboard(event) {
    switch (event.key) {
      case "1":
        this.switchDataMode("population");
        break;
      case "2":
        this.switchDataMode("gdp");
        break;
      case "3":
        this.switchDataMode("environment");
        break;
      case "4":
        this.switchDataMode("culture");
        break;
      case "d":
      case "D":
        this.switchViewMode("day");
        break;
      case "n":
      case "N":
        this.switchViewMode("night");
        break;
      case "Escape":
        this.hideInfoPanel();
        this.hideHelpModal();
        break;
      case " ":
        event.preventDefault();
        this.toggleRotation();
        break;
      case "h":
      case "H":
      case "?":
        this.showHelpModal();
        break;
    }
  }

  handleZoom(event) {
    // Prevent default scroll behavior
    event.preventDefault();

    // This would be implemented with proper camera controls
    // For now, just log the zoom direction
    const zoomDirection = event.deltaY > 0 ? "out" : "in";
    console.log("Zoom", zoomDirection);
  }

  toggleRotation() {
    this.globe.isRotating = !this.globe.isRotating;

    // Show notification
    const status = this.globe.isRotating ? "enabled" : "disabled";
    this.showModeChangeNotification(`Rotation ${status}`);
  }

  showCountryDetails(countryName) {
    const country = this.dataManager.getCountryByName(countryName);
    if (country) {
      this.globe.showCountryInfo(country);
    }
  }

  // Method to update data in real-time
  async refreshData() {
    try {
      const liveData = await this.dataManager.fetchLiveData(this.currentMode);
      // Update visualizations with new data
      this.globe.updateDataVisualization(this.currentMode);

      console.log("Data refreshed for mode:", this.currentMode);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  }

  // Auto-refresh data every 5 minutes
  startAutoRefresh() {
    setInterval(() => {
      this.refreshData();
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Method to export current view as image
  exportView() {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `livingglobe-${this.currentMode}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  }

  // Method to share current view
  shareView() {
    if (navigator.share) {
      navigator.share({
        title: "LivingGlobe - Interactive Globe",
        text: `Check out this ${this.currentMode} visualization on LivingGlobe!`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.showModeChangeNotification("URL copied to clipboard");
      });
    }
  }
}
