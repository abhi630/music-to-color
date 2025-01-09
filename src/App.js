import React, { useState } from 'react';
import { MantineProvider, Container, Title, Text, Paper, Group, Stack, Alert, createTheme } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { Notifications, notifications } from '@mantine/notifications';
import IconUpload from '@tabler/icons-react/dist/esm/icons/IconUpload';
import IconX from '@tabler/icons-react/dist/esm/icons/IconX';
import IconCheck from '@tabler/icons-react/dist/esm/icons/IconCheck';
import IconAlertCircle from '@tabler/icons-react/dist/esm/icons/IconAlertCircle';
import IconMusic from '@tabler/icons-react/dist/esm/icons/IconMusic';
import ColorVisualizer from './components/ColorVisualizer';
import ColorExplanation from './components/ColorExplanation';
import { loadAudioFile, extractBasicFeatures, extractTempo, extractRms, extractPitch, extractTimbre, extractKey, extractMood } from './utils/audioProcessing';
import { mapFeaturesToColor, mapTempoToColor, mapPitchToColor, mapLoudnessToColor, mapKeyToColor, mapMoodToColor, generateColorPalette } from './utils/colorMapping';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';

const Header = () => (
  <Paper
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(88, 28, 135, 0.1)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)',
    }}
  >
    <Container size="lg">
      <Group py="md">
        <Title
          order={2}
          style={{ 
            background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.8rem',
          }}
        >
          Harmony Hues
        </Title>
      </Group>
    </Container>
  </Paper>
);

const theme = createTheme({
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontWeight: '600',
  },
  components: {
    Container: {
      defaultProps: {
        size: 'lg',
      },
    },
    Paper: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
      },
      styles: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        },
      },
    },
    Title: {
      styles: {
        root: {
          letterSpacing: '-0.01em',
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

      console.log('Extracted Audio Features:', {
        fileName: file.name,
        tempo,
        rms,
        pitch,
        timbre,
        key,
        mood
      });

      const tempoColor = mapTempoToColor(tempo);
      const pitchColor = mapPitchToColor(pitch);
      const loudnessColor = mapLoudnessToColor(rms);
      const keyColor = mapKeyToColor(key);
      const moodColor = mapMoodToColor(mood);
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
          tempo: tempoColor,
          pitch: pitchColor,
          loudness: loudnessColor,
          key: keyColor,
          mood: moodColor,
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
    return (
      <Stack spacing="xl" style={{ width: '100%' }}>
        <Stack spacing="sm" align="center" mb="xl">
          <Title 
            order={1} 
            style={{ 
              fontSize: '2.5rem',
              background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 10px rgba(124, 58, 237, 0.1)',
            }}
          >
            Turn your music into color palette
          </Title>
          <Text 
            size="xl" 
            style={{ 
              background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 50%, #A78BFA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}
          >
            Inspired by Tempo, Pitch, Loudness, and Mood
          </Text>
        </Stack>

        <Paper
          radius="lg"
          p="md"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
            border: isDragging 
              ? '2px dashed #7C3AED'
              : '2px dashed rgba(124, 58, 237, 0.3)',
            transition: 'all 0.2s ease',
            boxShadow: isDragging 
              ? '0 8px 30px rgba(124, 58, 237, 0.15)'
              : '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Dropzone
            onDrop={handleFileUpload}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            accept={['audio/*']}
            loading={isLoading}
            p="xl"
            style={{
              border: 'none',
              background: 'transparent',
              transition: 'transform 0.2s ease',
              transform: isDragging ? 'scale(0.99)' : 'scale(1)',
            }}
          >
            <Group position="center" spacing="xl">
              {isLoading ? (
                <WaveformLoader />
              ) : (
                <>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: isDragging 
                      ? 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)'
                      : 'rgba(124, 58, 237, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: isDragging 
                      ? '0 4px 12px rgba(124, 58, 237, 0.2)'
                      : 'none',
                  }}>
                    {isDragging ? (
                      <IconMusic 
                        size="1.8rem" 
                        style={{ color: '#fff' }}
                      />
                    ) : (
                      <IconUpload 
                        size="1.8rem" 
                        style={{ color: '#7C3AED' }}
                      />
                    )}
                  </div>
                  <div>
                    <Text size="lg" weight={500} style={{ 
                      color: isDragging ? '#4C1D95' : '#1a1b1e',
                      transition: 'color 0.2s ease',
                    }}>
                      {isDragging ? 'Drop to analyze' : 'Upload your audio'}
                    </Text>
                    <Text size="sm" c="dimmed" mt={7}>
                      Drag and drop or click to select a file
                    </Text>
                  </div>
                </>
              )}
            </Group>
          </Dropzone>
        </Paper>

        {error && (
          <Alert 
            icon={<IconAlertCircle size="1rem" />} 
            title="Error" 
            color="red" 
            radius="md"
            variant="light"
          >
            {error}
          </Alert>
        )}

        {audioFeatures && (
          <Paper p={0} radius="lg" style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            backdropFilter: 'blur(10px)',
            marginTop: '1rem',
          }}>
            <Group align="stretch" spacing={0} noWrap>
              <div style={{ 
                flex: 2.5, 
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
              }}>
                <ColorVisualizer colors={audioFeatures.colors.palette} />
              </div>
              <div style={{ 
                width: '320px',
                borderLeft: '1px solid rgba(88, 28, 135, 0.1)',
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <ColorExplanation audioFeatures={audioFeatures} />
              </div>
            </Group>
          </Paper>
        )}
      </Stack>
    );
  };

  return (
    <MantineProvider theme={theme}>
      <Header />
      <Container py="xl" style={{ 
        minHeight: '100vh',
        marginTop: '80px',
      }}>
        {renderContent()}
      </Container>
      <Notifications position="top-right" zIndex={200} />
    </MantineProvider>
  );
}

export default App;
