# Music Color Analyzer

A React-based web application that analyzes audio files and generates corresponding colors and visual representations based on various musical features.

## Features

- **Audio Analysis**: Upload and analyze audio files to extract musical features like:
  - Tempo (BPM)
  - Pitch
  - Loudness (RMS)
  - Timbre
  - Musical Key
  - Mood

- **Color Generation**:
  - Converts musical features into meaningful colors
  - Generates color palettes based on audio characteristics
  - Provides visual explanations for color choices

- **Brand Story Visualization**:
  - Translates audio features into brand identity elements
  - Creates visual representations of the music's emotional qualities
  - Suggests color schemes for branding purposes

## How It Works

1. **Audio Upload**: Users can drag and drop or select an audio file
2. **Feature Extraction**: The app analyzes the audio file to extract musical features
3. **Color Mapping**: Musical features are mapped to colors using carefully designed algorithms
4. **Visualization**: Results are displayed through various interactive visualizations

## Technical Stack

- React.js for the frontend
- Mantine UI for components and styling
- Web Audio API for audio processing
- Meyda.js for audio feature extraction

## Privacy & Legal

- **Audio Files**: 
  - Users should only upload audio files they have rights to use
  - No audio files are stored on our servers
  - All processing is done client-side in the browser
  - We do not collect or store any user data

- **Libraries & Dependencies**:
  - All libraries and frameworks used are open-source with MIT licenses
  - No proprietary code or assets are included

## Getting Started

To run this project locally:

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

## Live Demo

The application is deployed at: https://abhi630.github.io/music-to-color/

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
