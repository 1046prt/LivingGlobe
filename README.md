# 🌍 LivingGlobe - Interactive 3D World Explorer

An immersive 3D globe application that displays comprehensive country data with rich visualizations and interactive features.

## ✨ Features

### 🎮 Interactive Controls

- **Drag to Rotate**: Click and drag anywhere on the globe to rotate it
- **Zoom**: Use mouse wheel or trackpad to zoom in/out
- **Country Selection**: Click on red country markers to view detailed information
- **Hover Tooltips**: Hover over markers for quick country info

### 📊 Rich Country Data

- **15 Countries**: Argentina, Australia, Brazil, Canada, China, Germany, Spain, France, UK, India, Italy, Japan, Mexico, Russia, USA
- **Comprehensive Information**:
  - Basic demographics and geography
  - Economic indicators (GDP, employment, trade)
  - Government and political system
  - Cultural festivals and traditions
  - Tourism destinations and attractions
  - UNESCO World Heritage sites
  - Educational institutions
  - Historical timeline
  - Famous cities and landmarks

### 🎨 Visualization Modes

- **Population**: Marker sizes based on population
- **GDP**: Economic visualization
- **Environment**: Environmental indicators
- **Culture**: Cultural heritage sites

### 🌅 Day/Night Modes

- Toggle between day and night themes
- Dynamic lighting effects

### 📱 Responsive Design

- Works on desktop, tablet, and mobile devices
- Adaptive UI controls

## 🚀 Getting Started

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Development Server**:

   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   - Navigate to `http://localhost:3001` (or the port shown in terminal)

## 🎯 How to Use

### Basic Navigation

1. **Rotate Globe**: Click and drag anywhere on the blue globe
2. **Zoom**: Scroll with mouse wheel or use trackpad gestures
3. **View Country Info**: Click on any red country marker
4. **Quick Info**: Hover over markers for tooltips

### Control Panel (Left Side)

- **Data Layers**: Switch between Population, GDP, Environment, Culture
- **View Mode**: Toggle between Day and Night themes
- **Controls Guide**: Quick reference for interactions

### Information Panel (Right Side)

- Opens when you click a country marker
- Shows comprehensive country data including:
  - Basic information (capital, population, languages)
  - Economic data (GDP, employment)
  - Demographics (life expectancy, literacy)
  - Government information
  - Cultural highlights
  - Tourism data
  - UNESCO sites

### Footer Information

- Click the "ℹ️ Info" button (bottom right) to show/hide footer
- Contains app information and quick tips

### Keyboard Shortcuts

- **1-4**: Switch data modes (Population, GDP, Environment, Culture)
- **D**: Day mode
- **N**: Night mode
- **H** or **?**: Show help modal
- **Esc**: Close panels and modals
- **Space**: Toggle globe rotation

## 🗺️ Available Countries

The application includes detailed data for 15 major countries:

| Country           | Capital         | Population | Notable Features                       |
| ----------------- | --------------- | ---------- | -------------------------------------- |
| 🇺🇸 United States  | Washington D.C. | 331M       | Tech hub, diverse geography            |
| 🇨🇳 China          | Beijing         | 1.4B       | Ancient culture, modern economy        |
| 🇯🇵 Japan          | Tokyo           | 126M       | Technology, traditional culture        |
| 🇩🇪 Germany        | Berlin          | 84M        | Engineering, history                   |
| 🇬🇧 United Kingdom | London          | 68M        | Historical influence, culture          |
| 🇫🇷 France         | Paris           | 65M        | Art, cuisine, landmarks                |
| 🇮🇳 India          | New Delhi       | 1.4B       | Diverse culture, growing economy       |
| 🇮🇹 Italy          | Rome            | 60M        | Art, history, cuisine                  |
| 🇧🇷 Brazil         | Brasília        | 215M       | Amazon, carnival, football             |
| 🇨🇦 Canada         | Ottawa          | 38M        | Natural beauty, multiculturalism       |
| 🇷🇺 Russia         | Moscow          | 146M       | Largest country, rich resources        |
| 🇦🇺 Australia      | Canberra        | 26M        | Unique wildlife, natural wonders       |
| 🇪🇸 Spain          | Madrid          | 47M        | Culture, architecture, beaches         |
| 🇲🇽 Mexico         | Mexico City     | 129M       | Ancient civilizations, vibrant culture |
| 🇦🇷 Argentina      | Buenos Aires    | 45M        | Tango, beef, natural beauty            |

## 🛠️ Technical Details

### Built With

- **Three.js**: 3D graphics and globe rendering
- **D3.js**: Data visualization utilities
- **Vite**: Fast development and build tool
- **Modern JavaScript**: ES6+ features and modules

### Architecture

- **Modular Design**: Separate components for globe, data, and UI
- **Data-Driven**: JSON-based country data with rich metadata
- **Responsive**: Adaptive layouts for all screen sizes
- **Performance**: Optimized rendering and interactions

### Data Structure

Each country includes:

- Basic information (name, capital, population, etc.)
- Economic data (GDP, trade, employment)
- Demographics (age distribution, urbanization)
- Political system and current leaders
- Cultural information (festivals, food, symbols)
- Tourism data (cities, attractions, visitor numbers)
- Educational institutions and rankings
- Historical timeline and heritage sites
- Geographic features and climate data

## 🎨 Customization

The application is designed to be easily extensible:

1. **Add New Countries**: Add JSON files to `src/data/countries/`
2. **Modify Visualizations**: Update `SimpleGlobe.js` for new display modes
3. **Extend Data**: Add new fields to country JSON structure
4. **Custom Themes**: Modify CSS in `src/styles/main.css`

## 📝 License

MIT License - Feel free to use and modify for your projects!

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- Additional countries and data
- New visualization modes
- Enhanced mobile experience
- Performance optimizations
- Additional interactive features

---

## **Enjoy exploring the world with LivingGlobe! 🌍✨**
