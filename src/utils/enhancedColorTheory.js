import {
    hslToRgb,
    rgbToHsl,
    getContrastRatio,
    meetsContrastRequirements,
    improveColorAccessibility,
    checkPaletteAccessibility
} from './colorTheory';

/**
 * Enhanced color theory rules for musical color mapping
 * Inspired by Coolors.co color harmony and generation techniques
 */

// Constants for color temperature ranges
const TEMPERATURE_RANGES = {
    COOL: { min: 180, max: 270 },
    NEUTRAL: { min: 271, max: 359 },
    WARM: { min: 0, max: 179 }
};

// Golden ratio for color spacing
const PHI = 1.618033988749895;

// Enhanced harmony schemes with musical context
const ENHANCED_HARMONY_SCHEMES = {
    ANALOGOUS: {
        angles: [30, 60],
        weight: 1.0
    },
    COMPLEMENTARY: {
        angles: [180],
        weight: 1.0
    },
    TRIADIC: {
        angles: [120, 240],
        weight: 1.0
    },
    SPLIT_COMPLEMENTARY: {
        angles: [150, 210],
        weight: 1.0
    },
    SQUARE: {
        angles: [90, 180, 270],
        weight: 1.0
    },
    COMPOUND: {
        angles: [60, 180, 240],
        weight: 1.0
    },
    TETRADIC: {
        angles: [60, 180, 240],
        weight: 1.0
    }
};

/**
 * Calculate harmony weights based on mood and timbre
 */
function calculateHarmonyWeights(mood, timbre) {
    const weights = {
        ANALOGOUS: 1.0,
        COMPLEMENTARY: 1.0,
        TRIADIC: 1.0,
        SPLIT_COMPLEMENTARY: 1.0,
        SQUARE: 1.0,
        COMPOUND: 1.0,
        TETRADIC: 1.0
    };

    if (mood) {
        // High energy favors more contrasting combinations
        if (mood.energy > 0.7) {
            weights.COMPLEMENTARY *= 1.4;
            weights.SQUARE *= 1.3;
        } else if (mood.energy < 0.3) {
            weights.ANALOGOUS *= 1.4;
            weights.SPLIT_COMPLEMENTARY *= 1.3;
        }

        // High valence favors warmer, more harmonious combinations
        if (mood.valence > 0.7) {
            weights.TRIADIC *= 1.4;
            weights.ANALOGOUS *= 1.3;
        } else if (mood.valence < 0.3) {
            weights.COMPLEMENTARY *= 1.4;
            weights.SPLIT_COMPLEMENTARY *= 1.3;
        }
    }

    if (timbre) {
        // Complex timbre favors more sophisticated harmonies
        if (timbre.complexity > 0.7) {
            weights.COMPOUND *= 1.4;
            weights.TETRADIC *= 1.3;
        } else if (timbre.complexity < 0.3) {
            weights.ANALOGOUS *= 1.4;
            weights.COMPLEMENTARY *= 1.3;
        }

        // Bright timbre favors more contrasting harmonies
        if (timbre.brightness > 0.7) {
            weights.SQUARE *= 1.3;
            weights.TRIADIC *= 1.3;
        }
    }

    return weights;
}

/**
 * Parse color string into HSL components
 */
function parseColor(color) {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return [0, 0, 50];
    return match.slice(1).map(Number);
}

/**
 * Calculate weighted average between two values
 */
export function weightedAverage(val1, val2, weight1 = 1, weight2 = 1) {
    return (val1 * weight1 + val2 * weight2) / (weight1 + weight2);
}

/**
 * Variate a value based on intensity
 */
function variateValue(value, intensity, range = 10) {
    const variation = (Math.random() - 0.5) * range * intensity;
    return Math.max(0, Math.min(100, value + variation));
}

/**
 * Adjust color temperature based on mood
 */
function adjustColorTemperature(hue, energy) {
    let temperature;
    if (hue >= TEMPERATURE_RANGES.COOL.min && hue <= TEMPERATURE_RANGES.COOL.max) {
        temperature = 'COOL';
    } else if (hue >= TEMPERATURE_RANGES.NEUTRAL.min && hue < TEMPERATURE_RANGES.NEUTRAL.max) {
        temperature = 'NEUTRAL';
    } else {
        temperature = 'WARM';
    }

    // Shift hue based on energy level and current temperature
    const shift = (energy - 0.5) * 30;
    if (temperature === 'COOL' && energy > 0.7) {
        return (hue - shift + 360) % 360;
    } else if (temperature === 'WARM' && energy < 0.3) {
        return (hue + shift) % 360;
    }
    return hue;
}

/**
 * Generate a balanced color based on musical features
 */
function generateBalancedColor(h, s, l, mood, timbre) {
    let finalH = h;
    let finalS = s;
    let finalL = l;

    if (mood) {
        // Adjust saturation based on mood energy
        finalS = variateValue(s, mood.energy || 0.5, 15);
        
        // Adjust lightness based on mood valence
        finalL = variateValue(l, mood.valence || 0.5, 10);
    }

    if (timbre) {
        // Adjust hue based on timbre brightness
        finalH = (h + (timbre.brightness - 0.5) * 20 + 360) % 360;
        
        // Fine-tune saturation based on timbre complexity
        finalS = variateValue(finalS, timbre.complexity || 0.5, 10);
    }

    return `hsl(${Math.round(finalH)}, ${Math.round(finalS)}%, ${Math.round(finalL)}%)`;
}

/**
 * Check if colors are sufficiently distinct
 */
function checkColorDistinction(color1, color2) {
    const [h1, s1, l1] = parseColor(color1);
    const [h2, s2, l2] = parseColor(color2);
    
    const hueDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
    const satDiff = Math.abs(s1 - s2);
    const lightDiff = Math.abs(l1 - l2);
    
    return {
        distinct: hueDiff > 30 || satDiff > 20 || lightDiff > 20,
        hueDiff,
        satDiff,
        lightDiff
    };
}

/**
 * Optimize distinction between colors in a palette
 */
function optimizeDistinction(palette) {
    const optimizedPalette = [...palette];
    
    for (let i = 0; i < optimizedPalette.length; i++) {
        for (let j = i + 1; j < optimizedPalette.length; j++) {
            const distinction = checkColorDistinction(optimizedPalette[i], optimizedPalette[j]);
            
            if (!distinction.distinct) {
                const [h, s, l] = parseColor(optimizedPalette[j]);
                
                // Adjust the second color to increase distinction
                if (distinction.hueDiff < 30) {
                    const newHue = (h + 30) % 360;
                    optimizedPalette[j] = `hsl(${newHue}, ${s}%, ${l}%)`;
                } else if (distinction.satDiff < 20) {
                    const newSat = Math.min(100, s + 20);
                    optimizedPalette[j] = `hsl(${h}, ${newSat}%, ${l}%)`;
                } else if (distinction.lightDiff < 20) {
                    const newLight = Math.min(90, l + 20);
                    optimizedPalette[j] = `hsl(${h}, ${s}%, ${newLight}%)`;
                }
            }
        }
    }
    
    return optimizedPalette;
}

/**
 * Generate an enhanced harmonious color palette
 */
export function generateEnhancedPalette(baseColor, mood, timbre, count = 5) {
    // Calculate harmony weights based on musical features
    const weights = calculateHarmonyWeights(mood, timbre);
    
    // Select best harmony scheme based on weights
    const bestScheme = Object.entries(weights)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    const angles = ENHANCED_HARMONY_SCHEMES[bestScheme].angles;
    const [baseH, baseS, baseL] = parseColor(baseColor);
    const palette = [baseColor];

    // Generate harmony colors with temperature consideration
    angles.forEach(angle => {
        const h = (baseH + angle) % 360;
        const temperatureAdjusted = adjustColorTemperature(h, mood?.energy || 0.5);
        palette.push(generateBalancedColor(temperatureAdjusted, baseS, baseL, mood, timbre));
    });

    // Fill remaining slots with musically-informed variations
    while (palette.length < count) {
        const index = palette.length;
        const phi = PHI * index;
        const h = (baseH + (phi * 360)) % 360;
        const s = variateValue(baseS, mood?.intensity || 0.5, 20);
        const l = variateValue(baseL, timbre?.brightness || 0.5, 15);
        
        // Add shades and tints like Coolors.co
        if (index % 2 === 0) {
            // Create a shade (darker version)
            palette.push(`hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l * 0.7)}%)`);
        } else {
            // Create a tint (lighter version)
            palette.push(`hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.min(95, Math.round(l * 1.3))}%)`);
        }
    }

    return optimizeDistinction(palette);
}

/**
 * Optimize a color palette for better distinction and harmony
 */
export function optimizePalette(palette, mood, timbre) {
    // First optimize for distinction
    let optimizedPalette = optimizeDistinction(palette);
    
    // Then adjust for mood and timbre if provided
    if (mood || timbre) {
        optimizedPalette = optimizedPalette.map(color => {
            const [h, s, l] = parseColor(color);
            const rgb = hslToRgb(h/360, s/100, l/100);
            const balancedColor = generateBalancedColor(h, s, l, mood, timbre);
            const [bh, bs, bl] = parseColor(balancedColor);
            const balancedRgb = hslToRgb(bh/360, bs/100, bl/100);
            
            // Check contrast and improve accessibility if needed
            const contrastRatio = getContrastRatio(rgb, balancedRgb);
            if (!meetsContrastRequirements(contrastRatio)) {
                return improveColorAccessibility(balancedColor);
            }
            
            return balancedColor;
        });
    }
    
    // Final check for palette-wide accessibility
    if (!checkPaletteAccessibility(optimizedPalette)) {
        // Use weighted average to adjust colors while maintaining relationships
        optimizedPalette = optimizedPalette.map((color, i) => {
            if (i === 0) return color;
            const [h1, s1, l1] = parseColor(color);
            const [h2, s2, l2] = parseColor(optimizedPalette[i-1]);
            return generateBalancedColor(
                weightedAverage(h1, h2),
                weightedAverage(s1, s2),
                weightedAverage(l1, l2),
                mood,
                timbre
            );
        });
    }
    
    return optimizedPalette;
}

// Export color utility functions for future use
export {
    hslToRgb,
    rgbToHsl,
    getContrastRatio,
    meetsContrastRequirements,
    improveColorAccessibility,
    checkPaletteAccessibility
};