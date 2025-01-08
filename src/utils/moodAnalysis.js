// Genre-specific color associations based on research and cultural significance
const GENRE_COLOR_MAPPINGS = {
    classical: {
        primary: { h: 280, s: 60, l: 50 }, // Purple (sophistication, elegance)
        secondary: { h: 45, s: 40, l: 80 }, // Warm beige (tradition)
        cultural: 'Associated with European classical tradition'
    },
    jazz: {
        primary: { h: 220, s: 70, l: 40 }, // Deep blue (sophistication, night)
        secondary: { h: 30, s: 80, l: 50 }, // Warm orange (improvisation)
        cultural: 'Influenced by African-American musical tradition'
    },
    rock: {
        primary: { h: 0, s: 80, l: 40 }, // Deep red (energy, rebellion)
        secondary: { h: 0, s: 0, l: 20 }, // Dark gray (edge)
        cultural: 'Associated with youth counterculture and rebellion'
    },
    electronic: {
        primary: { h: 180, s: 100, l: 50 }, // Cyan (futuristic, synthetic)
        secondary: { h: 300, s: 100, l: 50 }, // Magenta (digital)
        cultural: 'Represents technological advancement and futurism'
    },
    folk: {
        primary: { h: 30, s: 60, l: 45 }, // Earth brown (nature, tradition)
        secondary: { h: 120, s: 40, l: 40 }, // Forest green (pastoral)
        cultural: 'Connected to traditional and rural culture'
    }
};

// Cultural mood associations across different traditions
const CULTURAL_MOOD_MAPPINGS = {
    western: {
        happy: { h: 60, s: 100, l: 50 }, // Bright yellow
        sad: { h: 230, s: 60, l: 40 }, // Deep blue
        peaceful: { h: 180, s: 40, l: 80 }, // Light blue
        angry: { h: 0, s: 100, l: 40 } // Deep red
    },
    eastern: {
        happy: { h: 0, s: 100, l: 50 }, // Red (prosperity in Chinese culture)
        sad: { h: 0, s: 0, l: 80 }, // White (mourning in some Asian cultures)
        peaceful: { h: 150, s: 40, l: 40 }, // Green (harmony in Buddhism)
        angry: { h: 0, s: 0, l: 0 } // Black (negativity)
    },
    african: {
        happy: { h: 45, s: 100, l: 50 }, // Gold (prosperity)
        sad: { h: 270, s: 50, l: 30 }, // Deep purple
        peaceful: { h: 120, s: 40, l: 40 }, // Green (life)
        angry: { h: 0, s: 80, l: 30 } // Dark red
    }
};

// ML-based mood classification using audio features
export const classifyMoodML = (features) => {
    const {
        tempo,
        rms,
        timbre,
        key,
        mfccs
    } = features;

    // Normalize features for ML input
    const normalizedFeatures = {
        tempo: (tempo - 40) / (200 - 40),
        loudness: Math.min(rms * 2, 1),
        complexity: timbre.complexity,
        brightness: timbre.brightness,
        roughness: timbre.roughness,
        warmth: timbre.warmth,
        isMinor: key.scale === 'minor' ? 1 : 0,
        keyConfidence: key.confidence
    };

    // Calculate emotional dimensions using weighted features
    const arousal = calculateArousal(normalizedFeatures);
    const valence = calculateValence(normalizedFeatures);
    const dominance = calculateDominance(normalizedFeatures);

    // Map to emotional space
    const emotionalState = mapToEmotionalState(arousal, valence, dominance);

    // Detect genre influence
    const genre = detectGenre(features);

    // Get cultural color associations
    const culturalColors = getCulturalColorMapping(emotionalState, genre);

    return {
        emotional: emotionalState,
        genre,
        arousal,
        valence,
        dominance,
        culturalColors
    };
};

function calculateArousal(features) {
    return (
        features.tempo * 0.3 +
        features.loudness * 0.3 +
        features.brightness * 0.2 +
        features.roughness * 0.2
    );
}

function calculateValence(features) {
    return (
        (1 - features.isMinor * 0.3) * // Major keys are more positive
        (features.warmth * 0.3 +
        (1 - features.roughness) * 0.2 +
        features.keyConfidence * 0.2 +
        (1 - features.complexity) * 0.3)
    );
}

function calculateDominance(features) {
    return (
        features.loudness * 0.4 +
        features.complexity * 0.3 +
        features.roughness * 0.3
    );
}

function mapToEmotionalState(arousal, valence, dominance) {
    // Map 3D emotion space to discrete emotions
    if (arousal > 0.7 && valence > 0.7) {
        return 'ecstatic';
    } else if (arousal > 0.7 && valence < 0.3) {
        return 'angry';
    } else if (arousal < 0.3 && valence > 0.7) {
        return 'content';
    } else if (arousal < 0.3 && valence < 0.3) {
        return 'depressed';
    } else if (dominance > 0.7) {
        return valence > 0.5 ? 'triumphant' : 'dominant';
    } else if (dominance < 0.3) {
        return valence > 0.5 ? 'peaceful' : 'submissive';
    } else {
        return 'neutral';
    }
}

function detectGenre(features) {
    // Simple genre detection based on audio features
    const { tempo, timbre, key } = features;

    if (tempo < 85 && timbre.complexity > 0.7 && key.confidence > 0.8) {
        return 'classical';
    } else if (tempo > 120 && timbre.brightness > 0.7) {
        return 'electronic';
    } else if (tempo > 100 && timbre.roughness > 0.6) {
        return 'rock';
    } else if (timbre.warmth > 0.7 && timbre.complexity < 0.4) {
        return 'folk';
    } else if (timbre.complexity > 0.6 && key.confidence > 0.6) {
        return 'jazz';
    }

    return 'other';
}

function getCulturalColorMapping(emotion, genre) {
    // Combine genre-specific and cultural mood colors
    const genreColors = GENRE_COLOR_MAPPINGS[genre] || GENRE_COLOR_MAPPINGS.other;
    const westernMood = CULTURAL_MOOD_MAPPINGS.western[mapEmotionToBasicMood(emotion)];
    const easternMood = CULTURAL_MOOD_MAPPINGS.eastern[mapEmotionToBasicMood(emotion)];

    return {
        genre: genreColors,
        western: westernMood,
        eastern: easternMood,
        combined: blendColors(genreColors.primary, westernMood)
    };
}

function mapEmotionToBasicMood(emotion) {
    const moodMap = {
        ecstatic: 'happy',
        angry: 'angry',
        content: 'peaceful',
        depressed: 'sad',
        triumphant: 'happy',
        dominant: 'angry',
        peaceful: 'peaceful',
        submissive: 'sad',
        neutral: 'peaceful'
    };
    return moodMap[emotion] || 'neutral';
}

function blendColors(color1, color2) {
    return {
        h: (color1.h + color2.h) / 2,
        s: (color1.s + color2.s) / 2,
        l: (color1.l + color2.l) / 2
    };
} 