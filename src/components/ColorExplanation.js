import React from 'react';
import { Paper, Text, Stack, Group, Badge, Tooltip } from '@mantine/core';
import { getContrastRatio, meetsContrastRequirements } from '../utils/colorTheory';

const ColorExplanation = ({ audioFeatures }) => {
  if (!audioFeatures?.colors?.palette) return null;

  const {
    tempo,
    pitch,
    rms,
    key,
    mood,
    timbre
  } = audioFeatures;

  const getTempoDescription = (bpm) => {
    if (bpm <= 80) return 'slow tempo (cool colors: blue to green)';
    if (bpm <= 120) return 'medium tempo (neutral colors: green to yellow)';
    return 'fast tempo (warm colors: yellow to red)';
  };

  const getMoodDescription = (mood) => {
    if (!mood) return null;
    
    let description = `${mood.primary} (${mood.energy.toFixed(2)} energy, ${mood.valence.toFixed(2)} valence)`;
    
    if (mood.genre) {
      description += `\nGenre influence: ${mood.genre}`;
      if (mood.cultural?.genre?.cultural) {
        description += `\n${mood.cultural.genre.cultural}`;
      }
    }

    if (mood.arousal) {
      description += `\nArousal: ${mood.arousal.toFixed(2)} (calm to excited)`;
    }
    if (mood.dominance) {
      description += `\nDominance: ${mood.dominance.toFixed(2)} (submissive to dominant)`;
    }

    return description;
  };

  const getKeyDescription = (key) => {
    if (!key) return null;
    return `${key.rootNote} ${key.scale} (${key.scale === 'major' ? 'brighter and more saturated' : 'darker and less saturated'})`;
  };

  const getCulturalDescription = (mood) => {
    if (!mood?.cultural) return null;
    
    const descriptions = [];
    if (mood.cultural.western) {
      descriptions.push('Western interpretation');
    }
    if (mood.cultural.eastern) {
      descriptions.push('Eastern interpretation');
    }
    if (descriptions.length > 0) {
      return `Cultural influences: ${descriptions.join(' and ')}`;
    }
    return null;
  };

  const getHarmonyDescription = (mood) => {
    if (!mood) return 'Complementary harmony';
    
    if (mood.energy > 0.7 && mood.valence > 0.7) {
      return 'Triadic harmony (vibrant, energetic combinations)';
    } else if (mood.energy < 0.3 && mood.valence < 0.3) {
      return 'Monochromatic harmony (subtle, cohesive variations)';
    } else if (mood.valence > 0.7) {
      return 'Split-complementary harmony (balanced, interesting)';
    } else if (mood.arousal > 0.7) {
      return 'Tetradic harmony (complex, dynamic combinations)';
    } else {
      return 'Analogous harmony (harmonious, pleasing)';
    }
  };

  const getAccessibilityInfo = (color) => {
    const backgroundColor = 'hsl(0, 0%, 100%)';
    const contrast = getContrastRatio(color, backgroundColor);
    const requirements = meetsContrastRequirements(color, backgroundColor);
    
    return {
      contrast,
      meetsAA: requirements.normal,
      meetsAAA: requirements.ratio >= 7,
      needsImprovement: !requirements.normal
    };
  };

  return (
    <Paper p="md" radius="md" withBorder>
      <Stack spacing="md">
        <Text size="xl" weight={700} color="indigo">Color Mapping Explanation</Text>
        
        <Stack spacing="xs">
          <Group spacing="xs">
            <Badge color="blue" size="lg">Base Color</Badge>
            <Text>Generated from {getTempoDescription(tempo)}</Text>
          </Group>

          {pitch && (
            <Group spacing="xs">
              <Badge color="cyan" size="lg">Saturation</Badge>
              <Text>
                Influenced by pitch ({pitch.toFixed(1)} Hz) - 
                {pitch < 500 ? ' lower pitch = less saturated' : ' higher pitch = more saturated'}
              </Text>
            </Group>
          )}

          {rms && (
            <Group spacing="xs">
              <Badge color="teal" size="lg">Brightness</Badge>
              <Text>
                Based on loudness (RMS: {rms.toFixed(3)}) - 
                {rms < 0.3 ? ' quieter = darker' : ' louder = brighter'}
              </Text>
            </Group>
          )}

          {key && (
            <Group spacing="xs">
              <Badge color="green" size="lg">Key Influence</Badge>
              <Text>Musical key: {getKeyDescription(key)}</Text>
            </Group>
          )}

          {mood && (
            <>
              <Group spacing="xs">
                <Badge color="yellow" size="lg">Mood</Badge>
                <Text style={{ whiteSpace: 'pre-line' }}>{getMoodDescription(mood)}</Text>
              </Group>
              
              {getCulturalDescription(mood) && (
                <Group spacing="xs">
                  <Badge color="grape" size="lg">Cultural</Badge>
                  <Text>{getCulturalDescription(mood)}</Text>
                </Group>
              )}

              <Group spacing="xs">
                <Badge color="pink" size="lg">Harmony</Badge>
                <Text>{getHarmonyDescription(mood)}</Text>
              </Group>
            </>
          )}

          {timbre && (
            <Group spacing="xs">
              <Badge color="violet" size="lg">Timbre</Badge>
              <Text>
                Complexity: {timbre.complexity.toFixed(2)}, 
                Brightness: {timbre.brightness.toFixed(2)}, 
                Warmth: {timbre.warmth.toFixed(2)}
              </Text>
            </Group>
          )}

          <Group spacing="xs">
            <Badge color="indigo" size="lg">Accessibility</Badge>
            <Stack spacing={4}>
              {audioFeatures.colors.palette.map((color, index) => {
                const accessibility = getAccessibilityInfo(color);
                return (
                  <Tooltip
                    key={index}
                    label={`Contrast ratio: ${accessibility.contrast.toFixed(2)}
                           AA: ${accessibility.meetsAA ? '✓' : '✗'}
                           AAA: ${accessibility.meetsAAA ? '✓' : '✗'}`}
                    multiline
                    width={200}
                  >
                    <Text size="sm" color={accessibility.needsImprovement ? 'red' : 'green'}>
                      Color {index + 1}: {accessibility.meetsAA ? 'Accessible' : 'Needs improvement'}
                    </Text>
                  </Tooltip>
                );
              })}
            </Stack>
          </Group>
        </Stack>

        <Text size="sm" color="dimmed" mt="md">
          The color palette is generated using color harmony rules and accessibility guidelines, 
          ensuring both aesthetic appeal and practical usability. All colors are checked for 
          contrast against a white background and adjusted if needed to meet WCAG standards.
        </Text>
      </Stack>
    </Paper>
  );
};

export default ColorExplanation; 