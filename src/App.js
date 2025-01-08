import React, { useState } from 'react';
import { MantineProvider, Container, Title, Text, Paper, Group, Stack, Alert, createTheme } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { Notifications, notifications } from '@mantine/notifications';
import IconUpload from '@tabler/icons-react/dist/esm/icons/IconUpload';
import IconX from '@tabler/icons-react/dist/esm/icons/IconX';
import IconCheck from '@tabler/icons-react/dist/esm/icons/IconCheck';
import IconAlertCircle from '@tabler/icons-react/dist/esm/icons/IconAlertCircle';
import IconMusic from '@tabler/icons-react/dist/esm/icons/IconMusic';
import Navigation from './components/Navigation';
import ColorVisualizer from './components/ColorVisualizer';
import ColorExplanation from './components/ColorExplanation';
import BrandStoryVisualizer from './components/BrandStoryVisualizer';
import { loadAudioFile, extractBasicFeatures, extractTempo, extractRms, extractPitch, extractTimbre, extractKey, extractMood } from './utils/audioProcessing';
import { mapFeaturesToColor, generateColorPalette } from './utils/colorMapping';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';

const theme = createTheme({
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
  },
  components: {
    Tabs: {
      styles: {
        tab: {
          '&:hover': {
            backgroundColor: '#EEF2FF !important',
            color: '#581C87 !important',
            transform: 'scale(1.05)',
          },
          '&[data-active]': {
            backgroundColor: '#581C87 !important',
            color: 'white !important',
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
});

const WaveformLoader = () => (
  <div style={{
    width: '160px',
    height: '60px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 10px',
  }}>
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        style={{
          width: '4px',
          height: '100%',
          backgroundColor: 'white',
          borderRadius: '2px',
          animation: `waveform ${1.2 + i * 0.15}s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate-reverse`,
          opacity: 0.9,
          transform: 'scaleY(0.6)',
          transformOrigin: 'center',
        }}
      />
    ))}
    <style>
      {`
        @keyframes waveform {
          0% { transform: scaleY(0.2); }
          100% { transform: scaleY(1); }
        }
      `}
    </style>
  </div>
);

function App() {
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const handleFileUpload = async (files) => {
    const file = files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const { audioBuffer } = await loadAudioFile(file);
      const basicFeatures = extractBasicFeatures(audioBuffer);
      const tempo = await extractTempo(audioBuffer);
      const rms = extractRms(audioBuffer);
      const pitch = extractPitch(audioBuffer);
      const timbre = extractTimbre(audioBuffer);
      const key = extractKey(audioBuffer);
      const mood = extractMood(tempo, rms, key, timbre);

      const combinedColor = mapFeaturesToColor(tempo, pitch, rms, timbre, key, mood);
      const palette = generateColorPalette(tempo, pitch, rms, timbre, key, mood);

      setAudioFeatures({
        fileName: file.name,
        ...basicFeatures,
        tempo,
        rms,
        pitch,
        timbre,
        key,
        mood,
        colors: {
          combined: combinedColor,
          palette
        }
      });

      notifications.show({
        title: 'Success',
        message: 'Audio analysis complete!',
        color: 'green',
        icon: <IconCheck size="1.1rem" />,
      });
    } catch (err) {
      setError('Error processing audio file. Please try again.');
      notifications.show({
        title: 'Error',
        message: 'Failed to process audio file',
        color: 'red',
        icon: <IconX size="1.1rem" />,
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <Stack spacing="xl">
            <Paper
              radius="lg"
              p="xs"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: isDragging ? 'rgba(255,255,255,0.5)' : 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              <Dropzone
                onDrop={handleFileUpload}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                accept={['audio/*']}
                loading={false}
                p="md"
                radius="lg"
                style={{
                  border: `2px dashed ${isDragging ? 'rgba(255,255,255,0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                  background: isDragging ? 'rgba(255,255,255,0.1)' : 'transparent',
                }}
              >
                <Group position="center" spacing="xl" style={{ minHeight: 80, pointerEvents: 'none' }}>
                  {isLoading ? (
                    <WaveformLoader />
                  ) : (
                    <>
                      <div>
                        {isDragging ? (
                          <IconMusic size="2.5rem" stroke={1.5} style={{ color: 'rgba(255,255,255,0.9)' }} />
                        ) : (
                          <IconUpload size="2.5rem" stroke={1.5} style={{ color: 'rgba(255,255,255,0.9)' }} />
                        )}
                      </div>
                      <div>
                        <Text size="lg" inline style={{ 
                          color: '#fff',
                          fontWeight: 600,
                          letterSpacing: '0.02em',
                        }}>
                          {isDragging ? 'Drop your audio file here' : 'Drag an audio file here or click to select'}
                        </Text>
                        <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }} inline mt={7}>
                          Upload any audio file to analyze its features
                        </Text>
                      </div>
                    </>
                  )}
                </Group>
              </Dropzone>
            </Paper>

            {error && (
              <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" radius="md" style={{
                backgroundColor: 'rgba(225, 29, 72, 0.1)',
                borderColor: 'rgba(225, 29, 72, 0.2)',
              }}>
                {error}
              </Alert>
            )}

            {audioFeatures && (
              <>
                {/* Color Analysis */}
                <Paper p="md" radius="md" withBorder style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }}>
                  <Stack spacing="xl">
                    <ColorVisualizer audioFeatures={audioFeatures} />
                    <ColorExplanation audioFeatures={audioFeatures} />
                  </Stack>
                </Paper>

                {/* Audio Analysis */}
                <Paper p="md" radius="md" withBorder style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }}>
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
                        {audioFeatures.key && (
                          <Text size="sm">Key: {audioFeatures.key.rootNote} {audioFeatures.key.scale}</Text>
                        )}
                      </Stack>
                    </Group>
                  </Stack>
                </Paper>
              </>
            )}
          </Stack>
        );
      case 'brand':
        return audioFeatures ? (
          <Paper p="md" radius="md" withBorder style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}>
            <BrandStoryVisualizer audioFeatures={audioFeatures} />
          </Paper>
        ) : (
          <Text style={{ color: 'white', textAlign: 'center' }}>Please upload an audio file first</Text>
        );
      default:
        return null;
    }
  };

  return (
    <MantineProvider theme={theme}>
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #581C87 100%)',
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
      }}>
        <Notifications position="top-right" />
        <Container size="xl" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <Title order={1} style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem',
              lineHeight: 1.2,
            }}>
              Audio Color Analyzer
            </Title>
            <Text size="md" style={{ color: 'rgba(255,255,255,0.8)', letterSpacing: '0.02em', maxWidth: '600px', margin: '0 auto' }}>
              Upload an audio file to analyze its features and generate corresponding colors
            </Text>
          </div>

          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div style={{ 
            maxWidth: '800px',
            margin: '0 auto',
            width: '100%',
          }}>
            {renderContent()}
          </div>
        </Container>
      </div>
    </MantineProvider>
  );
}

export default App;
