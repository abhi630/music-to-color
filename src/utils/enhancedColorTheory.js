/**
 * Enhanced color theory rules for musical color mapping
 * Inspired by Coolors.co color harmony and generation techniques
 */

// Golden ratio for color spacing
const PHI = 1.618033988749895;

// Enhanced harmony schemes with musical context
const ENHANCED_HARMONY_SCHEMES = {
    COMPLEMENTARY: {
        angles: [180],
        musicalContext: {
            energy: 0.7,    // Works well with high energy
            complexity: 0.5  // Moderate complexity
        }
    },
    SPLIT_COMPLEMENTARY: {
        angles: [150, 210],
        musicalContext: {
            energy: 0.6,    // Moderate to high energy
            complexity: 0.6  // Moderate to high complexity
        }
    },
    TRIADIC: {
        angles: [120, 240],
        musicalContext: {
            energy: 0.8,    // High energy
            complexity: 0.7  // High complexity
        }
    },
    TETRADIC: {
        angles: [90, 180, 270],
        musicalContext: {
            energy: 0.75,   // High energy
            complexity: 0.8  // Very high complexity
        }
    },
    ANALOGOUS: {
        angles: [30, 60],
        musicalContext: {
            energy: 0.4,    // Lower energy
            complexity: 0.3  // Lower complexity
        }
    },
    MONOCHROMATIC: {
        angles: [0, 0, 0],
        musicalContext: {
            energy: 0.3,    // Low energy
            complexity: 0.2  // Low complexity
        }
    },
    // New schemes inspired by Coolors.co
    SQUARE: {
        angles: [90, 180, 270],
        musicalContext: {
            energy: 0.85,    // Very high energy
            complexity: 0.9   // Very high complexity
        }
    },
    COMPOUND: {
        angles: [30, 180, 210],
        musicalContext: {
            energy: 0.65,    // Moderate-high energy
            complexity: 0.75  // High complexity
        }
    }
};

// Color temperature mapping
const TEMPERATURE_RANGES = {
    COOL: { start: 180, end: 300 },    // Blues, Purples
    NEUTRAL: { start: 300, end: 60 },   // Purples to Yellows
    WARM: { start: 60, end: 180 }      // Yellows through Reds to Cyans
};

/**
 * Calculate color harmony weights based on musical features
 */
export function calculateHarmonyWeights(mood, timbre) {
    const weights = {};
    const energy = mood?.energy || 0.5;
    const complexity = timbre?.complexity || 0.5;
    const intensity = mood?.intensity || 0.5;

    for (const [scheme, context] of Object.entries(ENHANCED_HARMONY_SCHEMES)) {
        const energyDiff = Math.abs(energy - context.musicalContext.energy);
        const complexityDiff = Math.abs(complexity - context.musicalContext.complexity);
        // Add intensity influence
        const intensityFactor = intensity > 0.7 ? 1.2 : intensity < 0.3 ? 0.8 : 1;
        weights[scheme] = (1 - (energyDiff + complexityDiff) / 2) * intensityFactor;
    }

    return weights;
}

/**
 * Generate an enhanced harmonious color palette
 */
export function generateEnhancedPalette(baseColor, mood, timbre, count = 5) {
    const weights = calculateHarmonyWeights(mood, timbre);
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
 * Adjust color temperature based on energy
 */
function adjustColorTemperature(hue, energy) {
    let range;
    if (energy > 0.7) {
        range = TEMPERATURE_RANGES.WARM;
    } else if (energy < 0.3) {
        range = TEMPERATURE_RANGES.COOL;
    } else {
        range = TEMPERATURE_RANGES.NEUTRAL;
    }

    // Shift hue towards the appropriate temperature range
    const targetHue = (range.start + range.end) / 2;
    return weightedAverage(hue, targetHue, 0.7, 0.3);
}

/**
 * Generate a color balanced with musical features
 */
function generateBalancedColor(h, s, l, mood, timbre) {
    const intensity = mood?.intensity || 0.5;
    const brightness = timbre?.brightness || 0.5;
    const complexity = timbre?.complexity || 0.5;

    // Enhanced saturation adjustment inspired by Coolors.co
    const adjustedS = Math.min(100, Math.max(30,
        s * (1 + (intensity - 0.5) * 0.4) * (1 + (complexity - 0.5) * 0.2)
    ));

    // Enhanced lightness adjustment with better contrast
    const adjustedL = Math.min(90, Math.max(30,
        l * (1 + (brightness - 0.5) * 0.3)
    ));

    return `hsl(${Math.round(h)}, ${Math.round(adjustedS)}%, ${Math.round(adjustedL)}%)`;
}

/**
 * Optimize distinction between colors
 */
function optimizeDistinction(palette, threshold = 20) {
    const optimized = [...palette];
    let attempts = 0;
    const maxAttempts = 10;

    while (!checkColorDistinction(optimized) && attempts < maxAttempts) {
        for (let i = 1; i < optimized.length; i++) {
            const [h, s, l] = parseColor(optimized[i]);
            // Adjust hue slightly if colors are too similar
            const newHue = (h + 15) % 360;
            optimized[i] = `hsl(${newHue}, ${s}%, ${l}%)`;
        }
        attempts++;
    }

    return optimized;
}

/**
 * Helper function for weighted average calculation
 */
function weightedAverage(val1, val2, weight1, weight2) {
    return (val1 * weight1 + val2 * weight2) / (weight1 + weight2);
}

/**
 * Parse color string to HSL components
 */
function parseColor(color) {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) throw new Error('Invalid color format');
    return match.slice(1).map(Number);
}

/**
 * Variate a value within a range based on a factor
 */
function variateValue(base, factor, range) {
    const variation = (factor - 0.5) * range;
    return Math.min(100, Math.max(0, base + variation));
}

/**
 * Check if colors in a palette are sufficiently distinct
 */
export function checkColorDistinction(palette, threshold = 20) {
    for (let i = 0; i < palette.length; i++) {
        for (let j = i + 1; j < palette.length; j++) {
            const [h1] = parseColor(palette[i]);
            const [h2] = parseColor(palette[j]);
            const diff = Math.abs(h1 - h2);
            if (diff < threshold && diff > 360 - threshold) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Optimize palette for both harmony and distinction
 */
export function optimizePalette(palette, mood, timbre) {
    if (checkColorDistinction(palette)) {
        return palette;
    }

    const [baseColor] = palette;
    return generateEnhancedPalette(baseColor, mood, timbre, palette.length);
} 