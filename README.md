# Music Color Analyzer

A React-based web application that analyzes audio files and generates corresponding colors and visual representations based on musical features. The app creates meaningful color palettes that reflect the audio's characteristics while ensuring accessibility and visual harmony.

## Features

### Audio Analysis
- **Tempo Detection**: Analyzes BPM (40-200 range)
- **Pitch Analysis**: Extracts fundamental frequency
- **Loudness Measurement**: Calculates RMS (Root Mean Square) amplitude
- **Timbre Analysis**: Extracts spectral features including:
  - Complexity
  - Brightness
  - Warmth
  - Roughness
- **Key Detection**: Identifies musical key and scale
- **Mood Analysis**: Advanced analysis including:
  - Energy levels
  - Valence (emotional positivity)
  - Arousal (emotional intensity)
  - Dominance
  - Genre detection

### Color Generation

#### Base Color Mapping
- **Tempo → Hue**: Maps speed to color temperature
  - Slow (40-80 BPM): Cool colors (Blue to Purple)
  - Medium (80-120 BPM): Warm colors (Purple to Orange)
  - Fast (120-200 BPM): Hot colors (Orange to Red)
- **Pitch → Saturation**: Higher pitches increase color saturation (30-100%)
- **Loudness → Brightness**: Higher amplitude creates brighter colors (30-90%)

#### Genre-Based Color Associations
- **Classical**: Purple (sophistication) + Beige (tradition)
- **Jazz**: Deep Blue (night) + Orange (improvisation)
- **Rock**: Deep Red (energy) + Dark Gray (edge)
- **Electronic**: Cyan (futuristic) + Magenta (digital)
- **Folk**: Earth Brown (nature) + Forest Green (pastoral)

#### Accessibility Features
- WCAG compliance checking
- Contrast ratio calculations
- Automatic color adjustments for accessibility
- High-contrast alternatives

### Visual Representations
- **Piano Key Visualization**: Interactive color display
- **Brand Story Visualization**: 
  - Typography system with light/dark themes
  - Brand applications (logo, patterns)
  - Musical cityscape
  - Record collection
  - Musical library
  - Musical parking lot

## Technical Stack
- **Frontend**: React.js
- **UI Components**: Mantine UI (@mantine/core, @mantine/dropzone, @mantine/hooks, @mantine/notifications)
- **Icons**: Tabler Icons (@tabler/icons-react)
- **Audio Processing**: Meyda.js
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/abhi630/music-to-color.git

# Navigate to project directory
cd music-to-color

# Install dependencies
npm install

# Start the development server
npm start
```

Visit `http://localhost:3000` to view the app in your browser.

## Usage

1. **Upload Audio**:
   - Drag and drop or click to select an audio file
   - Supported formats: MP3, WAV, OGG

2. **View Results**:
   - Color palette generation
   - Visual representations
   - Detailed audio analysis
   - Accessibility metrics

## Live Demo
Visit the live application at: https://abhi630.github.io/music-to-color/

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.
