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
    // Generate base color from primary features
    const baseColor = generateBaseColor(bpm, pitch, rms);
    
    // Adjust color based on musical context
    const contextAdjustedColor = adjustColorWithContext(baseColor, key, mood);
    
    // Create final gradient
    if (timbre) {
        const finalColor = createDynamicGradient(contextAdjustedColor, timbre, key, mood);
        return finalColor;
    }
    
    return contextAdjustedColor;
};

function generateBaseColor(bpm, pitch, rms) {
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
    const normalizedPitch = pitch ? (pitch - 20) / (2000 - 20) : 0.5;
    const saturation = 30 + (normalizedPitch * 70); // Increased minimum saturation
    
    // 3. Map loudness to brightness (30-90%)
    const normalizedLoudness = Math.min(1, (rms || 0.5) * 2);
    const lightness = 30 + (normalizedLoudness * 60); // Increased minimum lightness
    
    return `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
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

// Helper function
function weightedAverage(val1, val2, weight1, weight2) {
    return (val1 * weight1 + val2 * weight2) / (weight1 + weight2);
}

/**
 * Generate a color palette based on all audio features
 */
export const generateColorPalette = (bpm, pitch, rms, timbre, key, mood) => {
    const baseColor = mapFeaturesToColor(bpm, pitch, rms, timbre, key, mood);
    const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    const [h, s, l] = hslMatch.slice(1).map(Number);
    
    return [
        baseColor,
        `hsl(${(h + 30) % 360}, ${Math.min(100, s + 10)}%, ${Math.min(90, l + 10)}%)`,
        `hsl(${(h + 60) % 360}, ${s}%, ${l}%)`,
        `hsl(${(h + 180) % 360}, ${Math.max(30, s - 10)}%, ${Math.max(30, l - 10)}%)`,
        `hsl(${(h + 210) % 360}, ${Math.min(100, s + 20)}%, ${l}%)`
    ];
};
  