import React from 'react';
import { Tooltip, CopyButton } from '@mantine/core';

const PianoKey = ({ color, index }) => {
  const isBlackKey = [1, 3, 6, 8, 10].includes(index % 12);

  return (
    <CopyButton value={color} timeout={2000}>
      {({ copied, copy }) => (
        <Tooltip
          label={copied ? "Copied!" : color}
          position="top"
          withArrow
        >
          <div style={{
            position: 'relative',
            height: isBlackKey ? '120px' : '180px',
            flex: 1,
            minWidth: '60px',
            cursor: 'pointer',
            transition: 'transform 0.1s ease',
          }}>
            {/* Key */}
            <div 
              onClick={copy}
              style={{
                position: 'absolute',
                top: 0,
                left: '2px',
                right: '2px',
                bottom: 0,
                background: color,
                borderRadius: '0 0 6px 6px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.1)',
                transform: copied ? 'translateY(2px)' : 'none',
              }} 
            />
          </div>
        </Tooltip>
      )}
    </CopyButton>
  );
};

const ColorVisualizer = ({ audioFeatures }) => {
  if (!audioFeatures?.colors?.palette) return null;

  return (
    <div style={{
      display: 'flex',
      gap: '0',
      justifyContent: 'center',
      padding: '1rem',
      background: 'linear-gradient(to bottom, #f0f0f0, #e0e0e0)',
      borderRadius: '8px',
      boxShadow: 'inset 0 -4px 12px rgba(0,0,0,0.1)',
    }}>
      {audioFeatures.colors.palette.map((color, index) => (
        <PianoKey 
          key={index} 
          color={color} 
          index={index}
        />
      ))}
    </div>
  );
};

export default ColorVisualizer; 