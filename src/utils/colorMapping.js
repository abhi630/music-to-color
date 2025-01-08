/**
 * Map tempo to a color (full spectrum)
 * @param {number} bpm - Tempo in beats per minute
 * @returns {string} - Color in HSL format
 */
export const mapTempoToColor = (bpm) => {
    // Map tempo ranges to specific hues:
    // Slow (40-80 BPM): Cool colors (Blue to Green) -> 180-240
    // Medium (81-120 BPM): Neutral colors (Green to Yellow) -> 60-180
    // Fast (121-200 BPM): Warm colors (Red to Yellow) -> 0-60
    
    const minBpm = 40;
    const maxBpm = 200;
    const normalizedBpm = Math.max(minBpm, Math.min(maxBpm, bpm));
    
    let hue;
    if (normalizedBpm <= 80) {
        // Map 40-80 BPM to 240-180 (blue to green)
        hue = 240 - ((normalizedBpm - 40) / 40) * 60;
    } else if (normalizedBpm <= 120) {
        // Map 81-120 BPM to 180-60 (green to yellow)
        hue = 180 - ((normalizedBpm - 80) / 40) * 120;
    } else {
        // Map 121-200 BPM to 60-0 (yellow to red)
        hue = 60 - ((normalizedBpm - 120) / 80) * 60;
    }
    
    const saturation = 85; // Strong color but not overwhelming
    const lightness = 50;  // Medium brightness
    
    return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
};

/**
 * Map pitch to a color (affects saturation)
 * @param {number} pitch - Pitch in Hz
 * @returns {string} - Color in HSL format
 */
export const mapPitchToColor = (pitch) => {
    // Map pitch to saturation (0-100%)
    let saturation = 50; // Default for no pitch
    if (pitch && pitch >= 20 && pitch <= 2000) {
        const minPitch = 20;
        const maxPitch = 2000;
        const normalizedPitch = (pitch - minPitch) / (maxPitch - minPitch);
        saturation = Math.min(100, Math.max(20, normalizedPitch * 100));
    }
    return `hsl(240, ${Math.round(saturation)}%, 50%)`; // Fixed hue and lightness
};

/**
 * Map loudness to a color (affects brightness)
 * @param {number} rms - RMS value
 * @returns {string} - Color in HSL format
 */
export const mapLoudnessToColor = (rms) => {
    // Map RMS to lightness (0-100%)
    const normalizedRms = Math.min(1, rms * 2);
    const lightness = 20 + (normalizedRms * 60); // Range from 20% to 80%
    return `hsl(120, 100%, ${Math.round(lightness)}%)`; // Fixed hue and saturation
};

/**
 * Map all features to a combined color following the mapping:
 * - Tempo -> Base hue (speed/energy)
 * - Pitch -> Color brightness and complexity
 * - Loudness -> Color intensity and saturation
 * - Timbre -> Gradient complexity and texture
 * - Key -> Color temperature and mood influence
 * - Mood -> Overall color scheme adjustment
 */
export const mapFeaturesToColor = (bpm, pitch, rms, timbre, key, mood) => {
    console.log('Input values:', { bpm, pitch, rms, timbre, key, mood });
    
    // Generate base color from primary features
    const baseColor = generateBaseColor(bpm, pitch, rms);
    console.log('Base Color:', baseColor);
    
    // Adjust color based on musical context
    const contextAdjustedColor = adjustColorWithContext(baseColor, key, mood);
    console.log('Context Adjusted Color:', contextAdjustedColor);
    
    // Create final gradient
    if (timbre) {
        const finalColor = createDynamicGradient(contextAdjustedColor, timbre, key, mood);
        console.log('Final Gradient Color:', finalColor);
        return finalColor;
    }
    
    return contextAdjustedColor;
};

function generateBaseColor(bpm, pitch, rms) {
    console.log('Generating base color from:', { bpm, pitch, rms });
    
    // 1. Map tempo to base hue (0-360)
    const minBpm = 40;
    const maxBpm = 200;
    const normalizedTempo = Math.max(minBpm, Math.min(maxBpm, bpm || 120));
    let hue;
    
    // Modified tempo mapping for more variation
    if (normalizedTempo <= 80) {
        // Slow tempos: Cool colors (Blue to Purple)
        hue = 240 - ((normalizedTempo - 40) / 40) * 90; // 240->150
    } else if (normalizedTempo <= 120) {
        // Medium tempos: Warm colors (Purple to Orange)
        hue = 150 - ((normalizedTempo - 80) / 40) * 120; // 150->30
    } else {
        // Fast tempos: Hot colors (Orange to Red)
        hue = 30 - ((normalizedTempo - 120) / 80) * 30; // 30->0
    }
    
    // 2. Map pitch to saturation (30-100%)
    // Use a default pitch value that produces medium saturation if pitch is null
    const defaultPitch = 440; // A4 note
    const normalizedPitch = pitch ? (pitch - 20) / (2000 - 20) : 0.5;
    const saturation = 30 + (normalizedPitch * 70); // Increased minimum saturation
    
    // 3. Map loudness to brightness (30-90%)
    const normalizedLoudness = Math.min(1, (rms || 0.5) * 2);
    const lightness = 30 + (normalizedLoudness * 60); // Increased minimum lightness
    
    const color = `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
    console.log('Generated base color components:', { hue, saturation, lightness });
    return color;
}

function adjustColorWithContext(baseColor, key, mood) {
    const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    let [h, s, l] = hslMatch.slice(1).map(Number);
    
    // 4. Adjust for key (major/minor)
    if (key) {
        if (key.scale === 'major') {
            // Shift towards warm colors more dramatically
            h = weightedAverage(h, (h + 60) % 360, 0.6, 0.4);
            s = Math.min(100, s * 1.2); // More saturation for major
            l = Math.min(90, l * 1.15);  // Brighter for major
        } else {
            // Shift towards cool colors more dramatically
            h = weightedAverage(h, (h - 60 + 360) % 360, 0.6, 0.4);
            s = Math.max(30, s * 0.85);  // Less saturation for minor
            l = Math.max(30, l * 0.85);  // Darker for minor
        }
    }
    
    // 5. Apply mood modifications with more dramatic effects
    if (mood) {
        // Energetic/Happy moods: much more vibrant
        if (mood.energy > 0.7) {
            s = Math.min(100, s * 1.3);
            l = Math.min(90, l * 1.2);
            h = weightedAverage(h, 60, 0.7, 0.3); // Shift towards yellow
        }
        // Melancholic/Sad moods: more muted and cool
        else if (mood.energy < 0.3) {
            s = Math.max(30, s * 0.7);
            l = Math.max(30, l * 0.8);
            h = weightedAverage(h, 240, 0.7, 0.3); // Shift towards blue
        }
        
        // Adjust based on valence (emotional positivity)
        if (mood.valence > 0.7) {
            h = weightedAverage(h, 45, 0.7, 0.3); // Shift towards orange-yellow
            s = Math.min(100, s * 1.2);
        } else if (mood.valence < 0.3) {
            h = weightedAverage(h, 270, 0.7, 0.3); // Shift towards purple
            s = Math.max(30, s * 0.8);
        }
    }
    
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

function createDynamicGradient(baseColor, timbre, key, mood) {
    // Remove unused destructured values
    const { complexity } = timbre;
    const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    const [h, s, l] = hslMatch.slice(1).map(Number);
    
    // 6. Create texture based on timbre
    const normalizedComplexity = Math.min(1, Math.max(0, complexity));
    const angle = Math.round(((key?.root || 0) * 30 + (mood?.energy || 0.5) * 180) % 360);
    
    // Simple timbre: minimal color variation
    // Complex timbre: more color stops and variation
    if (normalizedComplexity < 0.3) {
        // Simple timbre: subtle gradient
        return `linear-gradient(${angle}deg, 
            hsl(${h}, ${s}%, ${l}%), 
            hsl(${(h + 10) % 360}, ${s}%, ${Math.min(80, l + 10)}%))`;
    } else {
        // Complex timbre: more varied gradient
        return `linear-gradient(${angle}deg, 
            hsl(${h}, ${s}%, ${l}%),
            hsl(${(h + 30) % 360}, ${Math.min(100, s + 10)}%, ${Math.min(80, l + 10)}%),
            hsl(${(h + 60) % 360}, ${Math.max(20, s - 10)}%, ${Math.max(20, l - 10)}%))`;
    }
}

// Helper functions
function weightedAverage(val1, val2, weight1, weight2) {
    return (val1 * weight1 + val2 * weight2) / (weight1 + weight2);
}

function getKeyHue(rootNote) {
    const keyHues = {
        'C': 0,    // Red
        'G': 60,   // Yellow
        'D': 30,   // Orange
        'A': 270,  // Purple
        'E': 240,  // Blue
        'B': 210,  // Blue-Green
        'F#': 180, // Green
        'C#': 150, // Yellow-Green
        'G#': 120, // Green
        'D#': 90,  // Yellow
        'A#': 330, // Pink
        'F': 300,  // Magenta
    };
    return keyHues[rootNote] || 0;
}

function getMoodHue(moodType) {
    const moodHues = {
        'Energetic/Happy': 60,    // Yellow
        'Cheerful/Positive': 30,  // Orange
        'Peaceful/Calm': 120,     // Green
        'Melancholic/Tense': 270, // Purple
        'Sad/Depressed': 240,     // Blue
        'Aggressive/Intense': 0    // Red
    };
    return moodHues[moodType] || 0;
}

/**
 * Map musical key to color
 * @param {Object} keyInfo - Key detection results
 * @returns {string} - Color in HSL format
 */
export const mapKeyToColor = (keyInfo) => {
    // eslint-disable-next-line no-unused-vars
    const { root, scale, confidence } = keyInfo;
    
    // Base hue for each root note (C = 0, G = 60, etc. following circle of fifths)
    const rootHues = {
        'C': 60,   // Yellow
        'G': 30,   // Orange-Yellow
        'D': 0,    // Red
        'A': 330,  // Pink
        'E': 300,  // Purple
        'B': 270,  // Blue-Purple
        'F#': 240, // Blue
        'C#': 210, // Blue-Green
        'G#': 180, // Green
        'D#': 150, // Yellow-Green
        'A#': 120, // Green-Yellow
        'F': 90,   // Yellow-Orange
    };
    
    // Get base hue from root note
    const baseHue = rootHues[keyInfo.rootNote];
    
    // Adjust saturation based on scale type and confidence
    const saturation = scale === 'major' 
        ? 70 + (confidence * 30)  // Brighter for major
        : 60 + (confidence * 30); // Slightly less bright for minor
    
    // Adjust lightness based on scale type
    const lightness = scale === 'major'
        ? 65  // Brighter for major
        : 45; // Darker for minor
    
    return `hsl(${baseHue}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
};

/**
 * Map mood to color
 * @param {Object} mood - Mood characteristics
 * @returns {string} - Color in HSL format
 */
export const mapMoodToColor = (mood) => {
    const { energy, valence, intensity } = mood;
    
    // Base hues for different moods
    const moodHues = {
        'Energetic/Happy': 60,    // Yellow
        'Cheerful/Positive': 30,  // Orange
        'Peaceful/Calm': 120,     // Green
        'Melancholic/Tense': 270, // Purple
        'Sad/Depressed': 240,     // Blue
        'Aggressive/Intense': 0    // Red
    };

    // Get base hue from primary mood
    const hue = moodHues[mood.primary];
    
    // Saturation based on intensity
    const saturation = 25 + (intensity * 75); // Range: 25-100
    
    // Lightness based on valence and energy
    const lightness = 20 + (((valence + energy) / 2) * 60); // Range: 20-80
    
    return `hsl(${hue}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
};

/**
 * Generate a color palette based on all audio features
 * @param {number} bpm - Tempo in BPM
 * @param {number} pitch - Pitch in Hz
 * @param {number} rms - RMS (loudness) value
 * @param {Object} timbre - Timbre features
 * @param {Object} key - Key detection results
 * @param {Object} mood - Mood analysis results
 * @returns {string[]} - Array of colors in the palette
 */
export const generateColorPalette = (bpm, pitch, rms, timbre, key, mood) => {
    console.log('Color Generation Input:', {
        bpm,
        pitch,
        rms,
        timbre,
        key,
        mood
    });
    
    // Get the base color from combined features
    const baseColor = generateBaseColor(bpm, pitch, rms);
    console.log('Generated Base Color:', baseColor);
    
    const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!hslMatch) {
        console.error('Failed to parse base color:', baseColor);
        return ['#FF0000', '#00FF00', '#0000FF']; // Fallback colors
    }
    
    let [baseHue, baseSaturation, baseLightness] = hslMatch.slice(1).map(Number);
    console.log('Parsed HSL values:', { baseHue, baseSaturation, baseLightness });

    // Create variations based on musical features
    const palette = [];

    // 1. Base color (from tempo, pitch, and loudness)
    palette.push(baseColor);

    // 2. Complementary color (opposite hue, adjusted for mood)
    const complementaryHue = (baseHue + 180) % 360;
    const complementaryS = mood ? Math.min(100, Math.max(0, baseSaturation * (1 + (mood.energy - 0.5) * 0.4))) : baseSaturation;
    const complementaryL = mood ? Math.min(100, Math.max(0, baseLightness * (1 + (mood.valence - 0.5) * 0.4))) : baseLightness;
    palette.push(`hsl(${Math.round(complementaryHue)}, ${Math.round(complementaryS)}%, ${Math.round(complementaryL)}%)`);

    // 3. Analogous colors (nearby hues, adjusted for key)
    const analogousOffset = key?.scale === 'major' ? 30 : 20;
    palette.push(`hsl(${Math.round((baseHue + analogousOffset) % 360)}, ${Math.round(baseSaturation)}%, ${Math.round(baseLightness)}%)`);
    palette.push(`hsl(${Math.round((baseHue - analogousOffset + 360) % 360)}, ${Math.round(baseSaturation)}%, ${Math.round(baseLightness)}%)`);

    // 4. Mood-influenced variation
    if (mood) {
        const moodSaturation = Math.min(100, Math.max(20, baseSaturation * (1 + (mood.energy - 0.5))));
        const moodLightness = Math.min(90, Math.max(10, baseLightness * (1 + (mood.valence - 0.5))));
        const moodHue = (baseHue + (mood.valence > 0.5 ? 30 : -30) + 360) % 360;
        palette.push(`hsl(${Math.round(moodHue)}, ${Math.round(moodSaturation)}%, ${Math.round(moodLightness)}%)`);
    }

    // 5. Key-influenced variation
    if (key) {
        const keyHue = (baseHue + (key.scale === 'major' ? 60 : -60) + 360) % 360;
        const keySaturation = key.scale === 'major' ? 
            Math.min(100, baseSaturation * 1.2) : // Brighter for major
            Math.max(20, baseSaturation * 0.8);   // More muted for minor
        const keyLightness = key.scale === 'major' ?
            Math.min(90, baseLightness * 1.1) :   // Brighter for major
            Math.max(20, baseLightness * 0.9);    // Darker for minor
        palette.push(`hsl(${Math.round(keyHue)}, ${Math.round(keySaturation)}%, ${Math.round(keyLightness)}%)`);
    }

    // 6. Timbre-influenced variations
    if (timbre && timbre.complexity !== undefined) {
        const { complexity } = timbre;
        // More complex timbre = more varied colors
        const timbreHue1 = (baseHue + complexity * 90) % 360;
        const timbreHue2 = (baseHue - complexity * 90 + 360) % 360;
        const timbreSaturation = Math.min(100, Math.max(20, baseSaturation * (1 + (complexity - 0.5))));
        
        palette.push(`hsl(${Math.round(timbreHue1)}, ${Math.round(timbreSaturation)}%, ${Math.round(baseLightness)}%)`);
        palette.push(`hsl(${Math.round(timbreHue2)}, ${Math.round(timbreSaturation)}%, ${Math.round(baseLightness)}%)`);
    }

    // 7. Intensity variations (based on RMS)
    if (typeof rms === 'number' && !isNaN(rms)) {
        const normalizedRms = Math.min(1, Math.max(0, rms * 2)); // Ensure RMS is between 0 and 1
        const safeBaseHue = isNaN(baseHue) ? 0 : baseHue;
        const safeBaseSaturation = isNaN(baseSaturation) ? 50 : baseSaturation;
        const safeBaseLightness = isNaN(baseLightness) ? 50 : baseLightness;

        const intensityLightness1 = Math.min(90, Math.max(10, safeBaseLightness + (normalizedRms * 40)));
        const intensityLightness2 = Math.min(90, Math.max(10, safeBaseLightness - (normalizedRms * 30)));
        const intensitySaturation = Math.min(100, Math.max(20, safeBaseSaturation + (normalizedRms * 20)));

        palette.push(`hsl(${Math.round(safeBaseHue)}, ${Math.round(intensitySaturation)}%, ${Math.round(intensityLightness1)}%)`);
        palette.push(`hsl(${Math.round(safeBaseHue)}, ${Math.round(intensitySaturation)}%, ${Math.round(intensityLightness2)}%)`);
    } else {
        // Fallback colors if RMS is invalid
        palette.push(`hsl(${Math.round(baseHue)}, 50%, 60%)`);
        palette.push(`hsl(${Math.round(baseHue)}, 50%, 40%)`);
    }

    // Log each color variation
    console.log('Generated Color Variations:', {
        base: palette[0],
        complementary: palette[1],
        analogous1: palette[2],
        analogous2: palette[3],
        mood: palette[4],
        key: palette[5],
        timbre1: palette[6],
        timbre2: palette[7],
        intensity1: palette[8],
        intensity2: palette[9]
    });

    // Filter out any duplicate colors and ensure we have a reasonable number of colors
    const uniquePalette = [...new Set(palette.filter(color => !color.includes('NaN')))];
    const finalPalette = uniquePalette.slice(0, 8); // Limit to 8 colors for a manageable palette
    
    console.log('Final Palette:', finalPalette);
    return finalPalette;
};
  