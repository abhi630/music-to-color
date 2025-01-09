import React, { useState } from "react";
import { Paper, Stack, Title, Group, Button, Text } from '@mantine/core';
import { loadAudioFile, extractBasicFeatures, extractTempo, extractRms, extractPitch, extractKey, extractMood } from "../utils/audioProcessing";
import { mapFeaturesToColor, generateColorPalette } from "../utils/colorMapping";
import ColorVisualizer from "./ColorVisualizer";
import ColorExplanation from "./ColorExplanation";

const FileUploadComponent = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  
    try {
      const { audioBuffer } = await loadAudioFile(file);
      const basicFeatures = extractBasicFeatures(audioBuffer);
      const bpm = await extractTempo(audioBuffer);
      const loudness = extractRms(audioBuffer);
      const detectedPitch = extractPitch(audioBuffer);
      const validPitch = detectedPitch >= 20 && detectedPitch <= 5000 ? detectedPitch : null;
      const key = extractKey(audioBuffer);
      const timbre = { complexity: 0.5 }; // Simplified for now
      const mood = extractMood(bpm, loudness, key, timbre);

      // Generate color palette
      const palette = generateColorPalette(bpm, validPitch, loudness, timbre, key, mood);
      
      // Combine all features
      const features = {
        ...basicFeatures,
        tempo: bpm,
        pitch: validPitch,
        rms: loudness,
        key,
        mood,
        timbre,
        colors: {
          palette
        }
      };

      setAudioFeatures(features);
      console.log("Processed Features:", features);
    } catch (error) {
      console.error("Error processing audio file:", error);
    }
  };

  return (
    <Stack spacing="xl" p="md">
      <Paper p="md" radius="md" withBorder>
        <Stack spacing="md">
          <Title order={2}>Upload Your Audio File</Title>
          <Group position="center">
            <Button 
              component="label" 
              variant="filled" 
              size="lg"
            >
              Choose Audio File
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </Button>
          </Group>
          {selectedFile && (
            <Text align="center" size="sm" color="dimmed">
              Selected: {selectedFile.name}
            </Text>
          )}
        </Stack>
      </Paper>

      {audioFeatures && (
        <>
          <ColorVisualizer audioFeatures={audioFeatures} />
          <ColorExplanation audioFeatures={audioFeatures} />
          
          <Paper p="md" radius="md" withBorder>
            <Stack spacing="sm">
              <Title order={3}>Audio Analysis Details</Title>
              <Group grow>
                <Stack spacing="xs">
                  <Text weight={700}>Basic Features</Text>
                  <Text size="sm">Duration: {audioFeatures.duration.toFixed(2)}s</Text>
                  <Text size="sm">Sample Rate: {audioFeatures.sampleRate} Hz</Text>
                  <Text size="sm">Channels: {audioFeatures.channelCount}</Text>
                </Stack>
                
                <Stack spacing="xs">
                  <Text weight={700}>Musical Features</Text>
                  <Text size="sm">Tempo: {audioFeatures.tempo.toFixed(1)} BPM</Text>
                  {audioFeatures.pitch && (
                    <Text size="sm">Pitch: {audioFeatures.pitch.toFixed(1)} Hz</Text>
                  )}
                  <Text size="sm">Loudness (RMS): {audioFeatures.rms.toFixed(3)}</Text>
                </Stack>
              </Group>
            </Stack>
          </Paper>
        </>
      )}
    </Stack>
  );
};

export default FileUploadComponent;
