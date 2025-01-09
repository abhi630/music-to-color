import React from 'react';
import { Paper, Tooltip, ActionIcon, Group, CopyButton } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';

const ColorVisualizer = ({ colors }) => {
  return (
    <Group align="center" spacing={32} noWrap style={{ width: '100%' }}>
      {/* Main color display */}
      <div style={{
        flex: 1,
        display: 'flex',
        height: '240px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}>
        {colors.map((color, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              backgroundColor: color,
              transition: 'all 0.3s ease',
              position: 'relative',
              cursor: 'pointer',
              '&:hover': {
                flex: 1.5,
              },
            }}
          >
            <CopyButton value={color} timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied!' : color.toUpperCase()} position="top" withArrow>
                  <ActionIcon
                    variant="filled"
                    onClick={copy}
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(4px)',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,1)',
                      },
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0';
                    }}
                  >
                    {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </div>
        ))}
      </div>

      {/* Color circles */}
      <Group spacing={12}>
        {colors.map((color, index) => (
          <Tooltip 
            key={index} 
            label={color.toUpperCase()} 
            position="top" 
            withArrow
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: color,
                boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                },
              }}
            />
          </Tooltip>
        ))}
      </Group>
    </Group>
  );
};

export default ColorVisualizer; 