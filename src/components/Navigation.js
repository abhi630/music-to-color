import React from 'react';
import { Tabs } from '@mantine/core';
import { IconUpload, IconPalette } from '@tabler/icons-react';

const Navigation = ({ activeTab, onTabChange }) => {
  return (
    <Tabs
      value={activeTab}
      onChange={onTabChange}
      variant="pills"
      styles={{
        root: {
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '8px',
          marginTop: '-12px',
          marginLeft: '-12px',
          marginRight: '-12px',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
        tab: {
          backgroundColor: 'white',
          color: '#4a5568',
          fontWeight: 600,
          padding: '12px 20px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '2px solid transparent',
          transform: 'scale(1)',
          '&:hover': {
            backgroundColor: '#EEF2FF',
            color: '#581C87',
            transform: 'scale(1.05)',
            border: '2px solid #581C87',
            boxShadow: '0 4px 12px rgba(88, 28, 135, 0.2)',
          },
          '&[data-active]': {
            backgroundColor: '#581C87',
            color: 'white',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 15px rgba(88, 28, 135, 0.4)',
            '&:hover': {
              backgroundColor: '#6b21a8',
              transform: 'scale(1.08)',
              boxShadow: '0 6px 20px rgba(88, 28, 135, 0.5)',
            },
          },
        },
        list: {
          gap: '12px',
          padding: '4px',
        },
        tabLabel: {
          fontSize: '0.95rem',
        },
        section: {
          marginRight: '8px',
        },
      }}
    >
      <Tabs.List grow>
        <Tabs.Tab
          value="upload"
          leftSection={<IconUpload size="1rem" />}
        >
          Audio Analysis
        </Tabs.Tab>
        <Tabs.Tab
          value="brand"
          leftSection={<IconPalette size="1rem" />}
        >
          Brand Story
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
};

export default Navigation; 