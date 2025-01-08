import React from 'react';
import { Paper, Stack } from '@mantine/core';

const VISUALIZATION_TYPES = {
  CIRCLES: 'circles',
  STRIPES: 'stripes',
  WAVES: 'waves',
  MOSAIC: 'mosaic'
};

const CirclesVisualization = ({ colors }) => (
  <div style={{
    position: 'relative',
    width: '100%',
    height: '100%',
  }}>
    {colors.map((color, index) => (
      <div
        key={index}
        style={{
          position: 'absolute',
          width: `${80 - (index * 10)}%`,
          height: `${80 - (index * 10)}%`,
          borderRadius: '50%',
          background: color,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.3s ease',
          opacity: 0.8,
        }}
      />
    ))}
  </div>
);

const StripesVisualization = ({ colors }) => (
  <div style={{
    width: '100%',
    height: '100%',
    display: 'flex',
  }}>
    {colors.map((color, index) => (
      <div
        key={index}
        style={{
          flex: 1,
          background: color,
          transition: 'all 0.3s ease',
          '&:hover': {
            flex: 2,
          }
        }}
      />
    ))}
  </div>
);

const WavesVisualization = ({ colors }) => (
  <div style={{
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  }}>
    {colors.map((color, index) => (
      <div
        key={index}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '40%',
          background: color,
          opacity: 0.7,
          borderRadius: '50%',
          transform: `translateY(${index * 20}%) scale(1.5, 0.5)`,
          animation: `wave ${3 + index}s ease-in-out infinite alternate`,
        }}
      />
    ))}
    <style>
      {`
        @keyframes wave {
          from { transform: translateY(${20}%) scale(1.5, 0.5); }
          to { transform: translateY(${30}%) scale(1.5, 0.5); }
        }
      `}
    </style>
  </div>
);

const MosaicVisualization = ({ colors }) => {
  const tiles = [];
  const size = 5;

  for (let i = 0; i < size * size; i++) {
    tiles.push(
      <div
        key={i}
        style={{
          background: colors[i % colors.length],
          flex: `1 0 ${100 / size}%`,
          aspectRatio: '1',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          }
        }}
      />
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexWrap: 'wrap',
    }}>
      {tiles}
    </div>
  );
};

const ColorVisualizations = ({ colors }) => {
  if (!colors || colors.length === 0) return null;

  const visualizations = {
    [VISUALIZATION_TYPES.CIRCLES]: <CirclesVisualization colors={colors} />,
    [VISUALIZATION_TYPES.STRIPES]: <StripesVisualization colors={colors} />,
    [VISUALIZATION_TYPES.WAVES]: <WavesVisualization colors={colors} />,
    [VISUALIZATION_TYPES.MOSAIC]: <MosaicVisualization colors={colors} />,
  };

  return (
    <Stack spacing="md">
      {Object.entries(visualizations).map(([type, visualization]) => (
        <Paper
          key={type}
          p={0}
          radius="lg"
          style={{
            width: '100%',
            height: '250px',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: '1rem',
          }}
        >
          {visualization}
        </Paper>
      ))}
    </Stack>
  );
};

export default ColorVisualizations; 