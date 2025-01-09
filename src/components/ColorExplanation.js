import React from 'react';
import { Paper, Text, Group, Stack } from '@mantine/core';
import { IconMusic, IconVolume, IconWaveSine, IconMusicHeart, IconMoodSmile } from '@tabler/icons-react';

const FeatureCard = ({ icon: Icon, title, value, color }) => (
  <Group spacing="sm" noWrap>
    <div style={{
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: `rgba(88, 28, 135, 0.1)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Icon size="1rem" style={{ color: '#581C87' }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <Text size="sm" c="dimmed" truncate>
        {title}
      </Text>
      <Group spacing="xs" noWrap>
        <Text size="sm" weight={500} truncate style={{ flex: 1 }}>
          {value}
        </Text>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '3px',
          backgroundColor: color,
          flexShrink: 0,
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
        }} />
      </Group>
    </div>
  </Group>
);

const ColorExplanation = ({ audioFeatures }) => {
  const { tempo, rms, pitch, key, mood, colors } = audioFeatures;
  
  return (
    <Stack spacing="md">
      <FeatureCard
        icon={IconMusic}
        title="Tempo"
        value={`${tempo.toFixed(0)} BPM`}
        color={colors.tempo}
      />
      <FeatureCard
        icon={IconVolume}
        title="Loudness"
        value={rms.toFixed(2)}
        color={colors.loudness}
      />
      <FeatureCard
        icon={IconWaveSine}
        title="Pitch"
        value={`${pitch.toFixed(0)} Hz`}
        color={colors.pitch}
      />
      <FeatureCard
        icon={IconMusicHeart}
        title="Key"
        value={`${key.rootNote} ${key.scale}`}
        color={colors.key}
      />
      <FeatureCard
        icon={IconMoodSmile}
        title="Mood"
        value={mood.primary}
        color={colors.mood}
      />
    </Stack>
  );
};

export default ColorExplanation; 