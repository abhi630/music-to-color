import {
    generateHarmoniousPalette,
    generateAccessiblePalette,
    checkPaletteAccessibility,
    suggestHarmonyType,
    improveColorAccessibility
} from './colorTheory';

import {
    generateEnhancedPalette,
    optimizePalette
} from './enhancedColorTheory';

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
    
    // 5. Apply mood modifications with cultural awareness
    if (mood) {
        // Get cultural color influences
        const culturalColors = mood.cultural;
        if (culturalColors) {
            // Blend with genre-specific colors
            const genreColor = culturalColors.genre.primary;
            h = weightedAverage(h, genreColor.h, 0.7, 0.3);
            s = weightedAverage(s, genreColor.s, 0.7, 0.3);
            l = weightedAverage(l, genreColor.l, 0.7, 0.3);

            // Blend with cultural mood colors
            const westernColor = culturalColors.western;
            const easternColor = culturalColors.eastern;
            if (westernColor && easternColor) {
                // Create a balanced blend of cultural influences
                const culturalH = weightedAverage(westernColor.h, easternColor.h, 0.6, 0.4);
                const culturalS = weightedAverage(westernColor.s, easternColor.s, 0.6, 0.4);
                const culturalL = weightedAverage(westernColor.l, easternColor.l, 0.6, 0.4);
                
                h = weightedAverage(h, culturalH, 0.7, 0.3);
                s = weightedAverage(s, culturalS, 0.7, 0.3);
                l = weightedAverage(l, culturalL, 0.7, 0.3);
            }
        } else {
            // Fallback to traditional mood mapping
            if (mood.energy > 0.7) {
                s = Math.min(100, s * 1.3);
                l = Math.min(90, l * 1.2);
                h = weightedAverage(h, 60, 0.7, 0.3); // Shift towards yellow
            } else if (mood.energy < 0.3) {
                s = Math.max(30, s * 0.7);
                l = Math.max(30, l * 0.8);
                h = weightedAverage(h, 240, 0.7, 0.3); // Shift towards blue
            }
            
            if (mood.valence > 0.7) {
                h = weightedAverage(h, 45, 0.7, 0.3); // Shift towards orange-yellow
                s = Math.min(100, s * 1.2);
            } else if (mood.valence < 0.3) {
                h = weightedAverage(h, 270, 0.7, 0.3); // Shift towards purple
                s = Math.max(30, s * 0.8);
            }
        }

        // Apply arousal and dominance influences
        if (mood.arousal > 0.7) {
            s = Math.min(100, s * 1.2); // More saturated for high arousal
            l = Math.min(90, l * 1.1); // Brighter for high arousal
        }
        
        if (mood.dominance > 0.7) {
            s = Math.min(100, s * 1.15); // More saturated for high dominance
            l = Math.max(30, l * 0.9); // Slightly darker for high dominance
        }
    }
    
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

function createDynamicGradient(baseColor, timbre, key, mood) {
    const { complexity, variation, brightness, roughness, warmth } = timbre;
    const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    const [h, s, l] = hslMatch.slice(1).map(Number);
    
    // Calculate gradient properties based on timbre features
    const angle = Math.round(((key?.root || 0) * 30 + (mood?.energy || 0.5) * 180) % 360);
    
    // Adjust color variations based on timbre characteristics
    const colorStops = [];
    
    // Base color
    colorStops.push(`hsl(${h}, ${s}%, ${l}%)`);
    
    // Brightness affects the lightness range
    const brightnessFactor = Math.max(0.3, brightness);
    const lightnessRange = 30 * brightnessFactor;
    
    // Warmth affects the hue shift direction and saturation
    const warmthFactor = Math.max(0.3, warmth);
    const hueShift = warmth > 0.5 ? 30 : -30;
    const saturationBoost = warmth > 0.5 ? 10 : -10;
    
    // Roughness affects the contrast between colors
    const roughnessFactor = Math.max(0.3, roughness);
    const contrastLevel = 20 * roughnessFactor;
    
    // Complexity determines the number of color stops
    if (complexity < 0.3) {
        // Simple, subtle gradient
        colorStops.push(
            `hsl(${h}, ${s}%, ${Math.min(90, l + lightnessRange * 0.5)}%)`
        );
    } else if (complexity < 0.7) {
        // Moderate complexity
        colorStops.push(
            `hsl(${(h + hueShift) % 360}, ${Math.min(100, s + saturationBoost)}%, ${Math.min(90, l + lightnessRange)}%)`,
            `hsl(${(h - hueShift + 360) % 360}, ${Math.max(20, s - saturationBoost)}%, ${Math.max(10, l - lightnessRange)}%)`
        );
    } else {
        // High complexity
        colorStops.push(
            `hsl(${(h + hueShift) % 360}, ${Math.min(100, s + saturationBoost)}%, ${Math.min(90, l + lightnessRange)}%)`,
            `hsl(${(h + hueShift * 2) % 360}, ${Math.min(100, s + saturationBoost * 1.5)}%, ${l}%)`,
            `hsl(${(h - hueShift + 360) % 360}, ${Math.max(20, s - saturationBoost)}%, ${Math.max(10, l - lightnessRange)}%)`
        );
    }
    
    // Variation affects the gradient type and pattern
    const gradientType = variation > 0.7 ? 'radial' : 'linear';
    const gradientPattern = variation > 0.5 ? 
        `${gradientType}-gradient(${angle}deg, ${colorStops.join(', ')})` :
        `linear-gradient(${angle}deg, ${colorStops.join(', ')})`;
    
    // Add texture based on roughness
    if (roughness > 0.6) {
        return `
            background: ${gradientPattern};
            background-blend-mode: overlay;
            background-size: 100% 100%, 50px 50px;
            background-image: ${gradientPattern},
                repeating-linear-gradient(${angle + 45}deg,
                    rgba(255,255,255,${0.1 * roughnessFactor}) 0px,
                    transparent ${contrastLevel}px,
                    rgba(0,0,0,${0.1 * roughnessFactor}) ${contrastLevel * 2}px
                )
        `;
    }
    
    return gradientPattern;
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
    
    // Generate initial palette using enhanced color theory
    const enhancedPalette = generateEnhancedPalette(baseColor, mood, timbre);
    
    // Optimize the palette for distinction
    const optimizedPalette = optimizePalette(enhancedPalette, mood, timbre);
    
    // Check and improve accessibility against background color
    const backgroundColor = 'hsl(0, 0%, 100%)'; // White background
    const accessibilityResults = checkPaletteAccessibility(optimizedPalette, backgroundColor);
    
    // Improve colors that don't meet accessibility requirements
    const accessiblePalette = accessibilityResults.map(result => 
        result.improvementNeeded ? 
            improveColorAccessibility(result.color, backgroundColor) : 
            result.color
    );
    
    return accessiblePalette;
};
  