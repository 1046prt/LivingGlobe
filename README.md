# LivingGlobe 🌍

A stunning 3D interactive globe where users can explore countries, cultures, and data in real time. Features a smooth-spinning Earth with glowing borders, dynamic data points, and interactive visualizations.

## ✨ Features

- **Interactive 3D Globe**: Smooth rotation and zoom with Three.js
- **Multiple Data Layers**: Population, GDP, Environment, and Culture visualizations
- **Real-time Data**: Dynamic data points that pulse with life
- **Day/Night Modes**: Beautiful atmospheric effects
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Shortcuts**: Quick navigation and mode switching

## 🚀 Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:3000`

## 🎮 Controls

### Mouse Controls

- **Drag**: Rotate the globe
- **Hover**: Show country tooltips
- **Click**: View detailed country information

### Keyboard Shortcuts

- **1-4**: Switch between data modes (Population, GDP, Environment, Culture)
- **D**: Switch to day mode
- **N**: Switch to night mode
- **Space**: Toggle globe rotation
- **Escape**: Close info panels

## 🛠️ Tech Stack

- **3D Engine**: Three.js for core 3D rendering and lighting
- **Data Visualization**: D3.js for mapping data to visuals
- **Build Tool**: Vite for fast development and building
- **Styling**: Pure CSS with custom animations and effects

## 📊 Data Modes

1. **Population**: Visualize country populations with color-coded intensity
2. **GDP**: Economic data representation with dynamic scaling
3. **Environment**: Environmental scores and sustainability metrics
4. **Culture**: Cultural sites and heritage information

## 🎨 Visual Features

- **Atmospheric Glow**: Realistic atmosphere shader effects
- **Pulsing Data Points**: Animated country markers
- **Smooth Transitions**: Fluid mode switching and animations
- **Responsive UI**: Clean, minimal interface overlay

## 🔧 Development

### Project Structure

```bash
src/
├── components/
│   └── Globe.js          # Main 3D globe component
├── data/
│   └── DataManager.js    # Data fetching and management
├── ui/
│   └── UIController.js   # User interface controls
├── styles/
│   └── main.css         # Styling and animations
└── main.js              # Application entry point
```

### Adding New Data Sources

To integrate real APIs, modify `DataManager.js`:

```javascript
async loadRealData() {
    // Example: REST Countries API
    const response = await fetch('https://restcountries.com/v3.1/all');
    const countries = await response.json();
    return countries;
}
```

### Customizing Visualizations

Modify the `getCountryColor()` method in `Globe.js` to add new visualization modes:

```javascript
case 'custom':
    return new THREE.Color(customColorLogic(country));
```

## 🌐 API Integration Ideas

- **REST Countries**: Country information and flags
- **World Bank**: Economic and development data
- **OpenWeatherMap**: Real-time weather data
- **UNESCO**: World heritage sites
- **News APIs**: Current events by country

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning and development!

## 🎯 Future Enhancements

- [ ] Real-time weather integration
- [ ] Flight path animations
- [ ] Cultural event calendar
- [ ] VR/AR support
- [ ] Social sharing features
- [ ] Data export capabilities
- [ ] Custom data upload
- [ ] Multi-language support

## 🌟 About LivingGlobe

LivingGlobe transforms the way we explore and understand our world. By combining cutting-edge 3D visualization with comprehensive global data, we create an immersive experience that brings countries, cultures, and statistics to life.

Our mission is to make global data accessible, beautiful, and engaging for everyone - from students and researchers to travelers and curious minds who want to discover the pulse of our living planet.

---

**LivingGlobe** - Where data meets beauty in an interactive 3D world! 🌍✨
