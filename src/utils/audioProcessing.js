/**
 * Load an audio file and return the AudioBuffer.
 * @param {File} file - The audio file to load.
 * @returns {Promise<{ audioContext: AudioContext, audioBuffer: AudioBuffer }>}
 */
export const loadAudioFile = async (file) => {
    if (!file) throw new Error("No file provided");
  
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
    return { audioContext, audioBuffer };
  };

  /**
   * Extract basic audio features such as duration, sample rate, and channel count.
   * @param {AudioBuffer} audioBuffer - The decoded audio buffer.
   * @returns {{ duration: number, sampleRate: number, channelCount: number }}
   */
  export const extractBasicFeatures = (audioBuffer) => ({
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    channelCount: audioBuffer.numberOfChannels,
  });
  
  /**
   * Optimized tempo extraction using improved beat detection
   * @param {AudioBuffer} audioBuffer - The decoded audio buffer.
   * @returns {Promise<number>} - The calculated tempo in BPM.
   */
  export const extractTempo = async (audioBuffer) => {
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);
    
    // Downsample for faster processing
    const downsampleFactor = 4;
    const downsampledLength = Math.floor(channelData.length / downsampleFactor);
    const downsampledData = new Float32Array(downsampledLength);
    
    for (let i = 0; i < downsampledLength; i++) {
        downsampledData[i] = channelData[i * downsampleFactor];
    }

    // Calculate signal properties
    const signalMean = calculateMean(downsampledData);
    const signalStd = calculateStandardDeviation(downsampledData, signalMean);
    
    // Dynamic threshold based on signal statistics
    const baseThreshold = signalMean + (signalStd * 1.5);
    
    // Multiple window sizes for different tempo ranges
    const windowSizes = [
        Math.floor(sampleRate / 4 / downsampleFactor),  // For slow tempos (40-80 BPM)
        Math.floor(sampleRate / 8 / downsampleFactor),  // For medium tempos (80-160 BPM)
        Math.floor(sampleRate / 16 / downsampleFactor)  // For fast tempos (160-200 BPM)
    ];

    let bestTempo = 120; // Default tempo
    let maxConfidence = 0;

    for (const windowSize of windowSizes) {
        const hopSize = Math.floor(windowSize / 2); // 50% overlap
        const onsetTimes = detectOnsets(
            downsampledData,
            windowSize,
            hopSize,
            baseThreshold,
            sampleRate * downsampleFactor
        );

        if (onsetTimes.length >= 2) {
            const { tempo, confidence } = calculateTempoFromOnsets(onsetTimes);
            
            if (confidence > maxConfidence) {
                maxConfidence = confidence;
                bestTempo = tempo;
            }
        }
    }

    return Math.round(bestTempo);
  };
  
  /**
   * Helper function to detect onsets in audio signal
   */
  function detectOnsets(signal, windowSize, hopSize, baseThreshold, originalSampleRate) {
    const onsetTimes = [];
    const energyHistory = [];
    const historySize = 43; // Approximately 1 second of history
    
    for (let i = 0; i < signal.length - windowSize; i += hopSize) {
        // Calculate energy in current window
        let windowEnergy = 0;
        for (let j = 0; j < windowSize; j++) {
            windowEnergy += Math.abs(signal[i + j]);
        }
        windowEnergy /= windowSize;
        
        // Update energy history
        energyHistory.push(windowEnergy);
        if (energyHistory.length > historySize) {
            energyHistory.shift();
        }
        
        // Calculate local threshold
        const localMean = calculateMean(energyHistory);
        const localThreshold = Math.max(baseThreshold, localMean * 1.5);
        
        // Onset detection with adaptive threshold
        if (windowEnergy > localThreshold && 
            windowEnergy > calculateMean(energyHistory.slice(-3)) * 1.2) {
            onsetTimes.push(i / originalSampleRate);
        }
    }
    
    return onsetTimes;
  }
  
  /**
   * Calculate tempo from onset times
   */
  function calculateTempoFromOnsets(onsetTimes) {
    const intervals = [];
    for (let i = 1; i < onsetTimes.length; i++) {
        intervals.push(onsetTimes[i] - onsetTimes[i - 1]);
    }
    
    // Group intervals into tempo bins (5 BPM resolution)
    const tempoBins = new Map();
    for (const interval of intervals) {
        const bpm = 60 / interval;
        if (bpm >= 40 && bpm <= 200) {
            const roundedBpm = Math.round(bpm / 5) * 5;
            tempoBins.set(roundedBpm, (tempoBins.get(roundedBpm) || 0) + 1);
        }
    }
    
    // Find the most common tempo
    let maxCount = 0;
    let bestTempo = 120;
    
    for (const [tempo, count] of tempoBins) {
        if (count > maxCount) {
            maxCount = count;
            bestTempo = tempo;
        }
    }
    
    // Calculate confidence based on consistency of intervals
    const confidence = maxCount / intervals.length;
    
    return { tempo: bestTempo, confidence };
  }
  
  /**
   * Calculate mean of array
   */
  function calculateMean(array) {
    return array.reduce((sum, val) => sum + val, 0) / array.length;
  }
  
  /**
   * Calculate standard deviation of array
   */
  function calculateStandardDeviation(array, mean) {
    const squareDiffs = array.map(value => {
        const diff = value - mean;
        return diff * diff;
    });
    const avgSquareDiff = calculateMean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }
  
  /**
   * Optimized RMS calculation using windowing
   * @param {AudioBuffer} audioBuffer - The decoded audio buffer.
   * @returns {number} - The calculated RMS value.
   */
  export const extractRms = (audioBuffer) => {
    const channelData = audioBuffer.getChannelData(0);
    const windowSize = 2048;
    let sum = 0;
    let count = 0;

    // Process in windows for better performance
    for (let i = 0; i < channelData.length; i += windowSize) {
        let windowSum = 0;
        const limit = Math.min(i + windowSize, channelData.length);
        
        for (let j = i; j < limit; j++) {
            windowSum += channelData[j] * channelData[j];
        }
        
        sum += windowSum;
        count += (limit - i);
    }

    return Math.sqrt(sum / count);
  };
  
  /**
   * Enhanced pitch detection using autocorrelation and multiple analysis windows
   * @param {AudioBuffer} audioBuffer - The decoded audio buffer
   * @returns {number|null} - The detected pitch in Hz, or null if no clear pitch
   */
  export const extractPitch = (audioBuffer) => {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // Use multiple window sizes for better accuracy across frequency ranges
    const windowSizes = [2048, 4096];
    const pitchCandidates = [];
    
    // Analyze multiple segments from the audio
    // eslint-disable-next-line no-unused-vars
    const numSegments = 3;
    // eslint-disable-next-line no-unused-vars
    const segmentLength = Math.floor(channelData.length / numSegments);
    
    for (const windowSize of windowSizes) {
        for (let i = 0; i < numSegments; i++) {
            const startIndex = Math.floor((channelData.length / numSegments) * i);
            const segment = channelData.slice(startIndex, startIndex + windowSize);
            
            // Apply Hanning window to reduce spectral leakage
            const windowedSegment = applyHanningWindow(segment);
            
            // Get pitch candidate using autocorrelation
            const { pitch, clarity } = autocorrelationPitch(windowedSegment, sampleRate);
            
            if (pitch && clarity > 0.5) { // Only consider results with good clarity
                pitchCandidates.push({ pitch, clarity });
            }
        }
    }
    
    // If we have candidates, return the most confident result
    if (pitchCandidates.length > 0) {
        // Sort by clarity and get the median of the top candidates
        pitchCandidates.sort((a, b) => b.clarity - a.clarity);
        const topCandidates = pitchCandidates.slice(0, Math.min(5, pitchCandidates.length));
        const medianPitch = getMedian(topCandidates.map(c => c.pitch));
        
        return Math.round(medianPitch);
    }
    
    return null;
  };

  /**
   * Apply Hanning window to reduce spectral leakage
   */
  function applyHanningWindow(signal) {
    const windowedSignal = new Float32Array(signal.length);
    for (let i = 0; i < signal.length; i++) {
        const multiplier = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (signal.length - 1)));
        windowedSignal[i] = signal[i] * multiplier;
    }
    return windowedSignal;
  }

  /**
   * Pitch detection using autocorrelation
   */
  function autocorrelationPitch(signal, sampleRate) {
    const correlations = new Float32Array(signal.length);
    let maxCorrelation = 0;
    let maxLag = 0;
    
    // Calculate autocorrelation for different lags
    for (let lag = 0; lag < signal.length; lag++) {
        let correlation = 0;
        let signalEnergy = 0;
        
        for (let i = 0; i < signal.length - lag; i++) {
            correlation += signal[i] * signal[i + lag];
            signalEnergy += signal[i] * signal[i];
        }
        
        // Normalize correlation
        correlations[lag] = signalEnergy > 0 ? correlation / signalEnergy : 0;
        
        // Find the highest correlation after the initial drop
        if (lag > 20 && correlations[lag] > maxCorrelation) {
            maxCorrelation = correlations[lag];
            maxLag = lag;
        }
    }
    
    // Convert lag to frequency
    const fundamentalFreq = sampleRate / maxLag;
    
    // Calculate clarity measure
    const clarity = maxCorrelation;
    
    // Only return pitch if it's in a reasonable range (20Hz - 2000Hz)
    if (fundamentalFreq >= 20 && fundamentalFreq <= 2000 && clarity > 0.3) {
        return { pitch: fundamentalFreq, clarity };
    }
    
    return { pitch: null, clarity: 0 };
  }

  /**
   * Get median value from array
   */
  function getMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  }
  
  /**
   * Extract timbre features using MFCCs
   * @param {AudioBuffer} audioBuffer - The decoded audio buffer
   * @returns {Object} - Timbre characteristics including spectralCentroid and mfccs
   */
  export const extractTimbre = (audioBuffer) => {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const fftSize = 2048;
    const hopSize = fftSize / 4;
    const segmentFeatures = [];

    // Analyze multiple segments for temporal variation
    for (let i = 0; i < channelData.length - fftSize; i += hopSize) {
        const segment = channelData.slice(i, i + fftSize);
        const windowedSegment = applyWindow(segment);
        const features = analyzeSegment(windowedSegment, sampleRate, fftSize);
        segmentFeatures.push(features);
    }

    // Aggregate features across segments
    const timbreFeatures = aggregateTimbreFeatures(segmentFeatures, sampleRate);

    // Calculate additional high-level features
    const complexity = calculateTimbreComplexity(timbreFeatures);
    const variation = calculateTemporalVariation(segmentFeatures);
    const brightness = timbreFeatures.spectralCentroid / (sampleRate / 4);
    const roughness = calculateRoughness(timbreFeatures);
    const warmth = calculateWarmth(timbreFeatures);

    return {
        complexity,      // Overall timbral complexity (0-1)
        variation,       // How much the timbre changes over time (0-1)
        brightness,      // Spectral brightness/sharpness (0-1)
        roughness,       // Timbral roughness/harshness (0-1)
        warmth,         // Timbral warmth (presence of lower harmonics) (0-1)
        features: timbreFeatures  // Detailed spectral features
    };
  };

  function analyzeSegment(segment, sampleRate, fftSize) {
    // Calculate basic spectral features
    const spectralFeatures = calculateSpectralFeatures(segment, sampleRate, fftSize);
    
    // Calculate harmonic features
    const harmonicFeatures = calculateHarmonicFeatures(segment, sampleRate, fftSize);
    
    // Calculate enhanced MFCCs for timbral texture
    const mfccs = calculateEnhancedMFCCs(segment, sampleRate, fftSize);
    
    return {
        ...spectralFeatures,
        ...harmonicFeatures,
        mfccs
    };
  }

  function calculateSpectralFeatures(signal, sampleRate, fftSize) {
    const magnitudes = calculateMagnitudeSpectrum(signal, fftSize);
    const frequencies = createFrequencyArray(fftSize, sampleRate);
    
    const centroid = calculateSpectralCentroid(magnitudes, frequencies);
    const spread = calculateSpectralSpread(magnitudes, frequencies, centroid);
    const flatness = calculateSpectralFlatness(magnitudes);
    const rolloff = calculateSpectralRolloff(magnitudes, frequencies);
    const peaks = analyzeSpectralPeaks(signal, sampleRate, fftSize);
    
    return {
        spectralCentroid: centroid,
        spectralSpread: spread,
        spectralFlatness: flatness,
        spectralRolloff: rolloff,
        spectralPeaks: peaks
    };
  }

  function calculateRoughness(features) {
    // Calculate roughness based on peak spacing and prominence
    const peakSpacing = calculatePeakSpacing(features.spectralPeaks);
    const peakProminence = calculatePeakProminence(features.spectralPeaks, features.magnitudes);
    
    // Normalize and combine factors
    const normalizedSpacing = 1 - Math.min(1, peakSpacing / 100);
    const normalizedProminence = Math.min(1, peakProminence / 0.5);
    
    return (normalizedSpacing * 0.6 + normalizedProminence * 0.4);
  }

  function calculateWarmth(features) {
    // Calculate warmth based on low-frequency energy and harmonic content
    const lowFreqEnergy = features.spectralRolloff / (features.sampleRate / 2);
    const harmonicBalance = features.harmonicRatio;
    
    // Combine factors with weights
    return Math.min(1, (1 - lowFreqEnergy) * 0.7 + harmonicBalance * 0.3);
  }

  function calculateHarmonicFeatures(signal, sampleRate, fftSize) {
    // Enhanced harmonic ratio calculation
    const harmonicRatio = calculateEnhancedHarmonicRatio(signal, sampleRate, fftSize);
    
    // Inharmonicity measure
    const inharmonicity = calculateInharmonicity(signal, sampleRate, fftSize);
    
    // Spectral peaks analysis
    const peakFeatures = analyzeSpectralPeaks(signal, sampleRate, fftSize);
    
    return {
        harmonicContent: harmonicRatio,
        inharmonicity,
        ...peakFeatures
    };
  }

  function aggregateTimbreFeatures(segmentFeatures, sampleRate) {
    // Calculate statistics across segments
    const features = {};
    const featureNames = Object.keys(segmentFeatures[0]);
    
    for (const feature of featureNames) {
        if (Array.isArray(segmentFeatures[0][feature])) {
            // For array features (like MFCCs), take the mean
            features[feature] = averageArrays(segmentFeatures.map(s => s[feature]));
        } else {
            // For scalar features, calculate statistics
            const values = segmentFeatures.map(s => s[feature]);
            features[feature] = {
                mean: calculateMean(values),
                std: calculateStandardDeviation(values),
                max: Math.max(...values),
                min: Math.min(...values)
            };
        }
    }
    
    // Calculate overall complexity based on feature variations
    const complexity = calculateTimbreComplexity(features);

  return {
        spectralCentroid: features.spectralCentroid.mean,
        complexity,
        harmonicContent: features.harmonicContent.mean,
        brightness: features.spectralRolloff.mean / (sampleRate/2),
        roughness: features.spectralFlatness.mean,
        mfccs: features.mfccs,
        temporalVariation: calculateTemporalVariation(features)
    };
  }

  // Helper functions for new calculations...
  // (I can provide these if you want to implement any specific one)
  
  /**
   * Extract musical key and scale from audio
   * @param {AudioBuffer} audioBuffer - The decoded audio buffer
   * @returns {Object} - Key information including root note and scale type
   */
  export const extractKey = (audioBuffer) => {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // Take multiple segments from different parts of the song
    const segmentDuration = 5; // 5 seconds per segment
    const segmentLength = Math.min(sampleRate * segmentDuration, channelData.length);
    const numSegments = Math.min(5, Math.floor(channelData.length / segmentLength));
    const segmentResults = [];
    
    for (let i = 0; i < numSegments; i++) {
        const startIndex = Math.floor((channelData.length - segmentLength) * (i / (numSegments - 1)));
        const segment = channelData.slice(startIndex, startIndex + segmentLength);
        const chromagram = calculateChromagram(segment, sampleRate);
        const keyResult = detectKey(chromagram);
        segmentResults.push(keyResult);
    }
    
    return combineKeyResults(segmentResults);
  };

  function calculateChromagram(signal, sampleRate) {
    const fftSize = 4096;
    const hopSize = Math.floor(fftSize / 4);
    const chromagram = new Array(12).fill(0);
    
    // Create Hanning window
    const window = new Float32Array(fftSize);
    for (let i = 0; i < fftSize; i++) {
        window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / fftSize));
    }
    
    let totalMagnitude = 0;
    
    // Process signal in overlapping windows
    for (let i = 0; i < signal.length - fftSize; i += hopSize) {
        const chunk = signal.slice(i, i + fftSize);
        
        // Apply window and compute magnitudes
        const magnitudes = new Float32Array(fftSize/2);
        for (let j = 0; j < fftSize; j++) {
            const windowedSample = chunk[j] * window[j];
            if (j < fftSize/2) {
                magnitudes[j] = Math.abs(windowedSample);
            }
        }
        
        // Map frequencies to pitch classes
        for (let j = 0; j < fftSize/2; j++) {
            const frequency = (j * sampleRate) / fftSize;
            if (frequency > 27.5 && frequency < 4186) { // Piano range A0 to C8
                const midiNote = 12 * Math.log2(frequency/440) + 69;
                const pitchClass = Math.round(midiNote) % 12;
                const magnitude = magnitudes[j];
                
                chromagram[pitchClass] += magnitude;
                totalMagnitude += magnitude;
            }
        }
    }
    
    // Normalize chromagram
    if (totalMagnitude > 0) {
        for (let i = 0; i < 12; i++) {
            chromagram[i] /= totalMagnitude;
        }
    }
    
    return chromagram;
  }

  function detectKey(chromagram) {
    let maxCorrelation = -1;
    let bestKey = 0;
    let bestScale = 'major';
    
    // Test all possible keys
    for (let root = 0; root < 12; root++) {
        const majorCorr = correlateProfiles(chromagram, MAJOR_PROFILE, root);
        const minorCorr = correlateProfiles(chromagram, MINOR_PROFILE, root);
        
        if (majorCorr > maxCorrelation) {
            maxCorrelation = majorCorr;
            bestKey = root;
            bestScale = 'major';
        }
        
        if (minorCorr > maxCorrelation) {
            maxCorrelation = minorCorr;
            bestKey = root;
            bestScale = 'minor';
        }
    }
    
    // Calculate confidence based on correlation strength
    const confidence = Math.max(0.3, Math.min(1, maxCorrelation));
    
    return {
        root: bestKey,
        scale: bestScale,
        confidence: confidence,
        correlation: maxCorrelation,
        rootNote: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][bestKey]
    };
  }

  function combineKeyResults(results) {
    // Count occurrences of each key
    const keyCount = new Map();
    let maxCount = 0;
    let bestResult = null;
    
    results.forEach(result => {
        const key = `${result.rootNote}${result.scale}`;
        const count = (keyCount.get(key) || 0) + 1;
        keyCount.set(key, count);
        
        if (count > maxCount || (count === maxCount && result.correlation > (bestResult?.correlation || 0))) {
            maxCount = count;
            bestResult = result;
        }
    });
    
    // Calculate overall confidence
    const confidence = Math.min(maxCount / results.length + bestResult.confidence, 1);
    
    return {
        ...bestResult,
        confidence: confidence
    };
  }

  function correlateProfiles(chroma, profile, root) {
    let correlation = 0;
    let profileSum = 0;
    let chromaSum = 0;
    
    for (let i = 0; i < 12; i++) {
        const chromaVal = chroma[i];
        const profileVal = profile[(i - root + 12) % 12];
        correlation += chromaVal * profileVal;
        profileSum += profileVal * profileVal;
        chromaSum += chromaVal * chromaVal;
    }
    
    // Normalized correlation coefficient
    return correlation / Math.sqrt(profileSum * chromaSum);
  }
  
  /**
   * Extract mood features from audio
   * @param {number} tempo - Tempo in BPM
   * @param {number} rms - Loudness (RMS)
   * @param {Object} key - Key information
   * @param {Object} timbre - Timbre characteristics
   * @returns {Object} - Mood characteristics
   */
  export const extractMood = (tempo, rms, key, timbre) => {
    // Use ML-based mood classification
    const mlMood = classifyMoodML({ tempo, rms, key, timbre });

    // Combine with traditional energy-valence calculation for backward compatibility
    const normalizedTempo = Math.min(Math.max((tempo - 40) / (200 - 40), 0), 1);
    const normalizedLoudness = Math.min(rms * 2, 1);
    const energy = (normalizedTempo * 0.6 + normalizedLoudness * 0.4);

    return {
        energy,              // 0 to 1 (low to high energy)
        valence: mlMood.valence,     // 0 to 1 (negative to positive)
        arousal: mlMood.arousal,     // 0 to 1 (calm to excited)
        dominance: mlMood.dominance, // 0 to 1 (submissive to dominant)
        primary: mlMood.emotional,   // Primary emotional state
        genre: mlMood.genre,         // Detected genre
        intensity: (mlMood.arousal + mlMood.valence) / 2, // Overall mood intensity
        cultural: mlMood.culturalColors  // Cultural color associations
    };
  };

  function calculateValence(isMinor, harmonicContent, keyConfidence) {
    // Base valence: minor keys tend towards negative, major towards positive
    let valence = isMinor ? 0.35 : 0.65;
    
    // Adjust based on harmonic content (more harmonic = more positive)
    valence += (harmonicContent - 0.5) * 0.2;
    
    // Weight by key confidence
    valence = valence * keyConfidence;
    
    return Math.min(Math.max(valence, 0), 1);
  }

  function classifyMood(energy, valence) {
    if (energy > 0.67) {
        return valence > 0.5 ? 'Energetic/Happy' : 'Aggressive/Intense';
    } else if (energy > 0.33) {
        return valence > 0.5 ? 'Cheerful/Positive' : 'Melancholic/Tense';
    } else {
        return valence > 0.5 ? 'Peaceful/Calm' : 'Sad/Depressed';
    }
  }
  
  // Key profiles from Krumhansl-Schmuckler key-finding algorithm
  const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  
  function applyWindow(signal, windowType = 'hanning') {
    const windowedSignal = new Float32Array(signal.length);
    for (let i = 0; i < signal.length; i++) {
        let multiplier;
        switch (windowType) {
            case 'hanning':
                multiplier = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (signal.length - 1)));
                break;
            case 'hamming':
                multiplier = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (signal.length - 1));
                break;
            default:
                multiplier = 1;
        }
        windowedSignal[i] = signal[i] * multiplier;
    }
    return windowedSignal;
  }

  function calculateMagnitudeSpectrum(signal, fftSize) {
    const magnitudes = new Float32Array(fftSize/2);
    for (let i = 0; i < fftSize/2; i++) {
        magnitudes[i] = Math.abs(signal[i]);
    }
    return magnitudes;
  }

  function createFrequencyArray(fftSize, sampleRate) {
    const frequencies = new Float32Array(fftSize/2);
    for (let i = 0; i < fftSize/2; i++) {
        frequencies[i] = (i * sampleRate) / fftSize;
    }
    return frequencies;
  }

  function calculateSpectralCentroid(magnitudes, frequencies) {
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < magnitudes.length; i++) {
        numerator += magnitudes[i] * frequencies[i];
        denominator += magnitudes[i];
    }
    
    return denominator !== 0 ? numerator / denominator : 0;
  }

  function calculateSpectralSpread(magnitudes, frequencies, centroid) {
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < magnitudes.length; i++) {
        numerator += magnitudes[i] * Math.pow(frequencies[i] - centroid, 2);
        denominator += magnitudes[i];
    }
    
    return denominator !== 0 ? Math.sqrt(numerator / denominator) : 0;
  }

  function calculateSpectralFlatness(magnitudes) {
    let geometricMean = 0;
    let arithmeticMean = 0;
    const epsilon = 1e-6;
    
    for (let i = 0; i < magnitudes.length; i++) {
        geometricMean += Math.log(magnitudes[i] + epsilon);
        arithmeticMean += magnitudes[i];
    }
    
    geometricMean = Math.exp(geometricMean / magnitudes.length);
    arithmeticMean = arithmeticMean / magnitudes.length;
    
    return arithmeticMean !== 0 ? geometricMean / arithmeticMean : 0;
  }

  function calculateSpectralRolloff(magnitudes, frequencies, percentile = 0.85) {
    const totalEnergy = magnitudes.reduce((sum, mag) => sum + mag, 0);
    let energySum = 0;
    
    for (let i = 0; i < magnitudes.length; i++) {
        energySum += magnitudes[i];
        if (energySum >= totalEnergy * percentile) {
            return frequencies[i];
        }
    }
    
    return frequencies[frequencies.length - 1];
  }

  function calculateEnhancedMFCCs(signal, sampleRate, fftSize) {
    const numCoefficients = 13;
    const melFilters = createMelFilterbank(fftSize/2, sampleRate, numCoefficients);
    const spectrum = calculateMagnitudeSpectrum(signal, fftSize);
    
    // Apply mel filterbank
    const melEnergies = new Float32Array(numCoefficients);
    for (let i = 0; i < numCoefficients; i++) {
        let sum = 0;
        for (let j = 0; j < fftSize/2; j++) {
            sum += spectrum[j] * melFilters[i][j];
        }
        melEnergies[i] = Math.log(sum + 1e-6);
    }
    
    return melEnergies;
  }

  function calculateEnhancedHarmonicRatio(signal, sampleRate, fftSize) {
    const spectrum = calculateMagnitudeSpectrum(signal, fftSize);
    let harmonicEnergy = 0;
    let totalEnergy = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
        const frequency = (i * sampleRate) / fftSize;
        totalEnergy += spectrum[i];
        
        // Check if frequency is roughly harmonic (multiple of fundamental)
        if (isHarmonicFrequency(frequency)) {
            harmonicEnergy += spectrum[i];
        }
    }
    
    return totalEnergy > 0 ? harmonicEnergy / totalEnergy : 0;
  }

  function calculateInharmonicity(signal, sampleRate, fftSize) {
    const spectrum = calculateMagnitudeSpectrum(signal, fftSize);
    let inharmonicity = 0;
    let totalEnergy = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
        const frequency = (i * sampleRate) / fftSize;
        const deviation = getHarmonicDeviation(frequency);
        inharmonicity += spectrum[i] * deviation;
        totalEnergy += spectrum[i];
    }
    
    return totalEnergy > 0 ? inharmonicity / totalEnergy : 0;
  }

  function analyzeSpectralPeaks(signal, sampleRate, fftSize) {
    const spectrum = calculateMagnitudeSpectrum(signal, fftSize);
    const peaks = findSpectralPeaks(spectrum);
    
    return {
        peakCount: peaks.length,
        peakSpacing: calculatePeakSpacing(peaks),
        peakProminence: calculatePeakProminence(peaks, spectrum)
    };
  }

  function averageArrays(arrays) {
    if (!arrays.length) return [];
    const length = arrays[0].length;
    const result = new Float32Array(length);
    
    for (let i = 0; i < length; i++) {
        let sum = 0;
        for (const array of arrays) {
            sum += array[i];
        }
        result[i] = sum / arrays.length;
    }
    
    return result;
  }

  function calculateTimbreComplexity(features) {
    // Combine multiple features to estimate overall complexity
    const spectralComplexity = features.spectralSpread.std / features.spectralSpread.mean;
    const harmonicComplexity = 1 - features.harmonicContent.mean;
    const temporalComplexity = features.spectralCentroid.std / features.spectralCentroid.mean;
    
    return (spectralComplexity + harmonicComplexity + temporalComplexity) / 3;
  }

  function calculateTemporalVariation(features) {
    // Calculate how much timbre varies over time
    const variations = [];
    for (const feature in features) {
        if (features[feature].std) {
            variations.push(features[feature].std / features[feature].mean);
        }
    }
    
    return variations.reduce((sum, val) => sum + val, 0) / variations.length;
  }

  // Additional utility functions
  function createMelFilterbank(fftSize, sampleRate, numFilters) {
    const filters = Array(numFilters).fill().map(() => new Float32Array(fftSize));
    const melMax = 2595 * Math.log10(1 + sampleRate/2/700);
    const melDelta = melMax / (numFilters + 1);
    
    for (let i = 0; i < numFilters; i++) {
        const melCenter = (i + 1) * melDelta;
        const freqCenter = 700 * (Math.pow(10, melCenter/2595) - 1);
        
        for (let j = 0; j < fftSize; j++) {
            const freq = (j * sampleRate) / (2 * fftSize);
            const response = Math.exp(-Math.pow(freq - freqCenter, 2) / (2 * Math.pow(melDelta, 2)));
            filters[i][j] = response;
        }
    }
    
    return filters;
  }

  function isHarmonicFrequency(frequency, tolerance = 0.1) {
    const fundamental = 440; // A4 as reference
    const harmonic = Math.round(frequency / fundamental);
    return Math.abs(frequency - (harmonic * fundamental)) / fundamental < tolerance;
  }

  function getHarmonicDeviation(frequency) {
    const fundamental = 440;
    const harmonic = Math.round(frequency / fundamental);
    return Math.abs(frequency - (harmonic * fundamental)) / fundamental;
  }

  function findSpectralPeaks(spectrum, threshold = 0.1) {
    const peaks = [];
    for (let i = 1; i < spectrum.length - 1; i++) {
        if (spectrum[i] > spectrum[i-1] && 
            spectrum[i] > spectrum[i+1] && 
            spectrum[i] > threshold * Math.max(...spectrum)) {
            peaks.push({ index: i, magnitude: spectrum[i] });
        }
    }
    return peaks;
  }

  function calculatePeakSpacing(peaks) {
    if (peaks.length < 2) return 0;
    const spacings = [];
    for (let i = 1; i < peaks.length; i++) {
        spacings.push(peaks[i].index - peaks[i-1].index);
    }
    return calculateMean(spacings);
  }

  function calculatePeakProminence(peaks, spectrum) {
    if (!peaks.length) return 0;
    let totalProminence = 0;
    
    for (const peak of peaks) {
        const leftMin = Math.min(...spectrum.slice(Math.max(0, peak.index - 10), peak.index));
        const rightMin = Math.min(...spectrum.slice(peak.index + 1, peak.index + 11));
        totalProminence += peak.magnitude - Math.min(leftMin, rightMin);
    }
    
    return totalProminence / peaks.length;
  }
  
  