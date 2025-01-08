/**
 * Color theory utilities for harmony rules and accessibility
 */

// Color harmony schemes
const HARMONY_SCHEMES = {
    COMPLEMENTARY: 180,
    SPLIT_COMPLEMENTARY: [150, 210],
    TRIADIC: [120, 240],
    TETRADIC: [90, 180, 270],
    ANALOGOUS: [30, 60],
    MONOCHROMATIC: [0, 0, 0]
};

/**
 * Convert HSL to RGB
 */
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [
        Math.round(255 * f(0)),
        Math.round(255 * f(8)),
        Math.round(255 * f(4))
    ];
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: h = 0;
        }
        h = Math.round(h * 60);
        if (h < 0) h += 360;
    }

    return [h, Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Calculate relative luminance for WCAG contrast
 */
function getRelativeLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors (WCAG)
 */
export function getContrastRatio(color1, color2) {
    const [r1, g1, b1] = parseColor(color1);
    const [r2, g2, b2] = parseColor(color2);
    
    const l1 = getRelativeLuminance(r1, g1, b1);
    const l2 = getRelativeLuminance(r2, g2, b2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color combination meets WCAG contrast requirements
 */
export function meetsContrastRequirements(color1, color2, level = 'AA') {
    const ratio = getContrastRatio(color1, color2);
    const requirements = {
        'AA': { normal: 4.5, large: 3 },
        'AAA': { normal: 7, large: 4.5 }
    };
    
    return {
        normal: ratio >= requirements[level].normal,
        large: ratio >= requirements[level].large,
        ratio
    };
}

/**
 * Generate a harmonious color palette based on a base color
 */
export function generateHarmoniousPalette(baseColor, scheme = 'COMPLEMENTARY', count = 5) {
    const [baseH, baseS, baseL] = parseColor(baseColor, 'hsl');
    const palette = [baseColor];
    
    const angles = HARMONY_SCHEMES[scheme];
    if (Array.isArray(angles)) {
        // Multiple angle shifts (e.g., triadic, split-complementary)
        angles.forEach(angle => {
            let h = (baseH + angle) % 360;
            palette.push(`hsl(${h}, ${baseS}%, ${baseL}%)`);
        });
    } else {
        // Single angle shift (e.g., complementary)
        let h = (baseH + angles) % 360;
        palette.push(`hsl(${h}, ${baseS}%, ${baseL}%)`);
    }
    
    // Fill remaining slots with variations
    while (palette.length < count) {
        const variation = palette.length % 2 === 0 ?
            `hsl(${baseH}, ${Math.max(0, baseS - 20)}%, ${Math.min(100, baseL + 15)}%)` :
            `hsl(${baseH}, ${Math.min(100, baseS + 10)}%, ${Math.max(0, baseL - 10)}%)`;
        palette.push(variation);
    }
    
    return palette;
}

/**
 * Adjust color for better accessibility
 */
export function improveColorAccessibility(color, backgroundColor, targetRatio = 4.5) {
    let [h, s, l] = parseColor(color, 'hsl');
    const originalL = l;
    let step = 5;
    let direction = 1;
    
    // First try adjusting lightness
    while (getContrastRatio(color, backgroundColor) < targetRatio && Math.abs(l - originalL) < 50) {
        l = Math.max(0, Math.min(100, l + (step * direction)));
        color = `hsl(${h}, ${s}%, ${l}%)`;
        
        if (l >= 100 || l <= 0) {
            direction *= -1; // Change direction if we hit the bounds
            step = Math.max(1, step / 2); // Reduce step size for finer control
        }
    }
    
    // If lightness adjustment wasn't enough, try adjusting saturation
    if (getContrastRatio(color, backgroundColor) < targetRatio) {
        s = Math.max(0, s - 20); // Reduce saturation to improve contrast
        color = `hsl(${h}, ${s}%, ${l}%)`;
    }
    
    return color;
}

/**
 * Parse color string into components
 */
function parseColor(color, format = 'rgb') {
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
        const [h, s, l] = hslMatch.slice(1).map(Number);
        return format === 'hsl' ? [h, s, l] : hslToRgb(h, s, l);
    }
    
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
        const [r, g, b] = rgbMatch.slice(1).map(Number);
        return format === 'rgb' ? [r, g, b] : rgbToHsl(r, g, b);
    }
    
    throw new Error('Invalid color format');
}

/**
 * Generate an accessible color palette
 */
export function generateAccessiblePalette(baseColor, backgroundColor, scheme = 'COMPLEMENTARY') {
    const palette = generateHarmoniousPalette(baseColor, scheme);
    return palette.map(color => improveColorAccessibility(color, backgroundColor));
}

/**
 * Check if a color palette meets accessibility guidelines
 */
export function checkPaletteAccessibility(palette, backgroundColor) {
    return palette.map(color => ({
        color,
        accessibility: meetsContrastRequirements(color, backgroundColor),
        improvementNeeded: !meetsContrastRequirements(color, backgroundColor).normal
    }));
}

/**
 * Get color harmony type suggestions based on mood
 */
export function suggestHarmonyType(mood) {
    if (!mood) return 'COMPLEMENTARY';
    
    if (mood.energy > 0.7 && mood.valence > 0.7) {
        return 'TRIADIC'; // High energy, positive mood - vibrant combinations
    } else if (mood.energy < 0.3 && mood.valence < 0.3) {
        return 'MONOCHROMATIC'; // Low energy, negative mood - subtle variations
    } else if (mood.valence > 0.7) {
        return 'SPLIT_COMPLEMENTARY'; // Positive mood - balanced but interesting
    } else if (mood.arousal > 0.7) {
        return 'TETRADIC'; // High arousal - complex combinations
    } else {
        return 'ANALOGOUS'; // Default - harmonious and pleasing
    }
} 