import React, { useState } from 'react';
import { Paper, Title, Stack, Group, Text } from '@mantine/core';
import { 
  IconMusic, 
  IconHeart, 
  IconBolt, 
  IconShield, 
  IconStarFilled,
  IconTypography,
  IconBuildingSkyscraper,
  IconBooks,
  IconCar,
  IconDisc,
} from '@tabler/icons-react';

const Building = ({ color, height = '200px', index }) => {
  // Calculate number of floors based on height with proper validation
  const heightValue = typeof height === 'string' ? parseInt(height) : 200;
  const numFloors = Math.max(3, Math.min(20, Math.floor(heightValue / 40)));
  
  return (
    <div 
      style={{ 
        position: 'relative',
        width: '18%',
        height: height || '200px',
      }}
    >
      {/* Main Building */}
      <div 
        style={{ 
          position: 'absolute',
          bottom: 0,
          width: '100%',
          backgroundColor: color,
          height: '100%',
          borderRadius: '8px 8px 0 0',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Roof Details */}
        <div style={{
          height: '20px',
          background: `linear-gradient(to right, ${color} 0%, rgba(255,255,255,0.2) 50%, ${color} 100%)`,
          borderRadius: '8px 8px 0 0',
        }} />

        {/* Windows Grid */}
        <div style={{
          height: 'calc(100% - 40px)', // Subtract roof and base height
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {[...Array(numFloors)].map((_, floorIndex) => (
            <div
              key={`floor-${index}-${floorIndex}`}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
                flex: 1,
              }}
            >
              {[...Array(3)].map((_, windowIndex) => (
                <div
                  key={`window-${index}-${floorIndex}-${windowIndex}`}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px',
                    height: '100%',
                    boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)',
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Base with Door */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '20px',
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '20%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '4px 4px 0 0',
          }} />
        </div>
      </div>

      {/* Reflection */}
      <div 
        style={{ 
          position: 'absolute',
          width: '100%',
          backgroundColor: color,
          height: '100%',
          top: '100%',
          transform: 'scaleY(-0.2)',
          opacity: 0.3,
          borderRadius: '8px 8px 0 0',
          filter: 'blur(1px)',
        }}
      />
    </div>
  );
};

const Book = ({ width, height, color, x }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 0,
      width: width,
      height: height,
      left: x,
    }}
  >
    {/* Book spine */}
    <div
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '2px',
        backgroundColor: color,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {/* Pattern overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #fff,
            #fff 2px,
            transparent 2px,
            transparent 8px
          )`
        }}
      />

      {/* Title line */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '2px',
          backgroundColor: 'rgba(255,255,255,0.3)'
        }}
      />

      {/* Spine details */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '33%',
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.1))'
        }}
      />
    </div>
  </div>
);

const Bookshelf = ({ colors }) => {
  // Generate static books
  const generateBooks = () => {
    const books = [];
    let currentX = 0;
    const shelfWidth = 100;

    while (currentX < shelfWidth) {
      const width = 2 + Math.random() * 4;
      const height = 75 + Math.random() * 20;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      books.push({
        width: `${width}%`,
        height: `${height}%`,
        color,
        x: `${currentX}%`
      });

      currentX += width + 0.2;
    }

    return books;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '180px' }}>
      {/* Books */}
      <div style={{ position: 'absolute', inset: 0, bottom: '16px' }}>
        {generateBooks().map((book, index) => (
          <Book key={index} {...book} />
        ))}
      </div>

      {/* Shelf board */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '16px',
          borderRadius: '4px',
          backgroundColor: '#8B4513',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {/* Wood grain effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.3,
            backgroundImage: `repeating-linear-gradient(
              90deg,
              #A0522D,
              #A0522D 2px,
              transparent 2px,
              transparent 20px
            )`
          }}
        />
      </div>
    </div>
  );
};

const CarSpot = ({ color, isOccupied }) => (
  <div style={{
    position: 'relative',
    width: '100%',
    height: '100%',
  }}>
    {/* Parking spot markings */}
    <div style={{
      position: 'absolute',
      inset: 0,
      border: '2px dashed rgba(255,255,255,0.3)',
    }} />
    
    {isOccupied && (
      <div style={{
        position: 'absolute',
        inset: '8px',
      }}>
        {/* Car body */}
        <div style={{ 
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          backgroundColor: color,
          boxShadow: '2px 2px 10px rgba(0,0,0,0.1)',
        }}>
          {/* Windows */}
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            right: '25%',
            bottom: '33%',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
          }} />
          
          {/* Wheels */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '25%',
            width: '8px',
            height: '8px',
            backgroundColor: '#333',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '0',
            right: '25%',
            width: '8px',
            height: '8px',
            backgroundColor: '#333',
            borderRadius: '50%',
          }} />
        </div>
      </div>
    )}
  </div>
);

const ParkingLot = ({ colors }) => {
  // Generate static parking layout
  const generateParkingLayout = () => {
    const spots = [];
    const occupiedSpots = 12; // Fixed number of cars
    
    for (let i = 0; i < 16; i++) {
      spots.push({
        isOccupied: i < occupiedSpots,
        color: colors[i % colors.length],
      });
    }
    
    return spots;
  };

  return (
    <div style={{ 
      position: 'relative',
      aspectRatio: '16/9',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Asphalt background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#2C3E50',
      }}>
        {/* Asphalt texture */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '16px 16px',
        }} />
      </div>

      {/* Grid of parking spots */}
      <div style={{
        position: 'absolute',
        inset: '32px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          height: '100%',
        }}>
          {generateParkingLayout().map((spot, i) => (
            <CarSpot key={i} {...spot} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Record = ({ color }) => (
  <div style={{
    position: 'relative',
    width: '80px',
    height: '80px',
    margin: '0 4px',
    flexShrink: 0,
  }}>
    {/* Record Sleeve */}
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: color,
      borderRadius: '8px',
      boxShadow: '2px 2px 10px rgba(0,0,0,0.1)',
    }}>
      {/* Record Pattern */}
      <div style={{
        position: 'absolute',
        inset: '10%',
        borderRadius: '50%',
        background: `
          radial-gradient(circle at center,
            #000 0%,
            #000 30%,
            ${color} 30.5%,
            ${color} 45%,
            #000 45.5%,
            #000 48%,
            ${color} 48.5%
          )
        `,
      }} />
      
      {/* Center Hole */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '12%',
        height: '12%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        backgroundColor: '#fff',
      }} />
    </div>
  </div>
);

const RecordShelf = ({ colors }) => {
  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: '120px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'hidden',
    }}>
      {/* Records Container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        maxWidth: '100%',
        overflow: 'hidden',
      }}>
        {colors.map((color, index) => (
          <Record key={index} color={color} />
        ))}
      </div>

      {/* Shelf Surface */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '16px',
        backgroundColor: '#8B4513',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        {/* Wood Grain */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.3,
          backgroundImage: `repeating-linear-gradient(
            90deg,
            #A0522D,
            #A0522D 2px,
            transparent 2px,
            transparent 20px
          )`,
        }} />
      </div>
    </div>
  );
};

const BrandStoryVisualizer = ({ audioFeatures }) => {
  if (!audioFeatures?.colors?.palette) return null;

  const colors = audioFeatures.colors.palette;
  
  // Map brand values to icons and colors based on audio features
  const brandValues = [
    { 
      name: 'Energy', 
      icon: IconBolt, 
      color: colors[0],
      description: `${audioFeatures.tempo.toFixed(0)} BPM suggests ${audioFeatures.tempo > 120 ? 'high' : 'moderate'} energy`
    },
    { 
      name: 'Emotion', 
      icon: IconHeart, 
      color: colors[1],
      description: `${audioFeatures.mood?.type || 'Balanced'} with ${audioFeatures.mood?.intensity || 'moderate'} intensity`
    },
    { 
      name: 'Harmony', 
      icon: IconMusic, 
      color: colors[2],
      description: `Key of ${audioFeatures.key.rootNote} ${audioFeatures.key.scale}`
    },
    { 
      name: 'Impact', 
      icon: IconShield, 
      color: colors[3],
      description: `${audioFeatures.rms > 0.5 ? 'Strong' : 'Subtle'} presence (${(audioFeatures.rms * 100).toFixed(0)}% intensity)`
    },
    { 
      name: 'Character', 
      icon: IconStarFilled, 
      color: colors[4],
      description: `${audioFeatures.timbre?.quality || 'Balanced'} timbre with ${audioFeatures.timbre?.brightness || 'moderate'} brightness`
    }
  ];

  // Building heights based on audio features with validation
  const getHeights = () => {
    const baseHeight = 200;
    const tempoFactor = (audioFeatures.tempo || 120) / 120; // Default to 120 if tempo is undefined
    const intensityFactor = (audioFeatures.rms || 0.5) * 2; // Default to 0.5 if rms is undefined
    
    const heights = [
      baseHeight * Math.max(0.5, Math.min(2, tempoFactor)),
      baseHeight * 1.2 * Math.max(0.5, Math.min(2, intensityFactor)),
      baseHeight * 1.4,
      baseHeight * 1.1 * Math.max(0.5, Math.min(2, intensityFactor)),
      baseHeight * Math.max(0.5, Math.min(2, tempoFactor))
    ];

    return heights.map(h => `${Math.round(h)}px`);
  };

  const heights = getHeights();

  return (
    <Stack spacing="xl">
      {/* Typography System */}
      <Paper p="md" radius="md" withBorder>
        <Stack spacing="lg">
          <Group position="apart" align="center">
            <Title order={3}>Typography System</Title>
            <IconTypography size={24} style={{ color: colors[0] }} />
          </Group>
          
          <Group grow>
            {/* Light Theme Typography */}
            <Paper p="xl" radius="md" style={{ 
              backgroundColor: 'white',
              flex: 1,
            }}>
              <Stack spacing="xl">
                <Stack spacing="xs">
                  <Text size="sm" weight={500} color="dimmed">Light Theme</Text>
                  <Text size="xl" weight={700} style={{ color: colors[0] }}>Display Text</Text>
                  <Text size="lg" weight={600} style={{ color: colors[1] }}>Heading Text</Text>
                  <Text style={{ color: colors[2] }}>Body text with perfect contrast and readability for light backgrounds. Maintaining visual hierarchy.</Text>
                  <Text size="sm" style={{ color: colors[3] }}>Caption text / UI elements</Text>
                </Stack>

                <Group spacing="xs">
                  {colors.map((color, index) => (
                    <div
                      key={index}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        backgroundColor: color,
                      }}
                    />
                  ))}
                </Group>
              </Stack>
            </Paper>

            {/* Dark Theme Typography */}
            <Paper p="xl" radius="md" style={{ 
              backgroundColor: colors[0],
              flex: 1,
            }}>
              <Stack spacing="xl">
                <Stack spacing="xs">
                  <Text size="sm" weight={500} color="white" opacity={0.7}>Dark Theme</Text>
                  <Text size="xl" weight={700} style={{ color: 'white' }}>Display Text</Text>
                  <Text size="lg" weight={600} style={{ color: colors[4] }}>Heading Text</Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Body text with perfect contrast and readability for dark backgrounds. Maintaining visual hierarchy.</Text>
                  <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Caption text / UI elements</Text>
                </Stack>

                <Group spacing="xs">
                  {colors.reverse().map((color, index) => (
                    <div
                      key={index}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        backgroundColor: color,
                      }}
                    />
                  ))}
                </Group>
              </Stack>
            </Paper>
          </Group>
        </Stack>
      </Paper>

      {/* Brand Applications */}
      <Paper p="md" radius="md" withBorder>
        <Stack spacing="lg">
          <Title order={3}>Brand Applications</Title>
          <Group grow>
            {/* Logo Preview */}
            <div style={{
              aspectRatio: '1',
              backgroundColor: colors[0],
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: colors[4],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <IconMusic size={40} style={{ color: colors[0] }} />
              </div>
            </div>

            {/* Typography Preview */}
            <div style={{
              aspectRatio: '1',
              backgroundColor: colors[1],
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '12px',
            }}>
              <Text style={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}>Display</Text>
              <Text style={{ color: 'white', fontSize: '24px' }}>Heading</Text>
              <Text style={{ color: 'white', fontSize: '16px', opacity: 0.8 }}>Body</Text>
            </div>

            {/* Pattern Preview */}
            <div style={{
              aspectRatio: '1',
              backgroundColor: colors[2],
              borderRadius: '12px',
              padding: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
            }}>
              {Array(9).fill(null).map((_, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: '1',
                    backgroundColor: colors[i % colors.length],
                    borderRadius: '6px',
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
          </Group>
        </Stack>
      </Paper>

      {/* Fun Visuals */}
      <Paper p="md" radius="md" withBorder>
        <Stack spacing="lg">
          <Group position="apart" align="center">
            <Title order={3}>Musical Cityscape</Title>
            <IconBuildingSkyscraper size={24} style={{ color: colors[0] }} />
          </Group>
          
          <div style={{
            height: '400px',
            background: 'linear-gradient(to bottom, #2C3E50 0%, #3498DB 60%, #2980B9 100%)',
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.2)',
          }}>
            {/* Sky Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0))',
              opacity: 0.5
            }} />

            {/* Stars */}
            <div style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
            }}>
              {Array(50).fill(null).map((_, i) => (
                <div
                  key={`star-${i}`}
                  style={{
                    position: 'absolute',
                    width: '2px',
                    height: '2px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    top: `${Math.random() * 60}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.2,
                  }}
                />
              ))}
            </div>

            {/* Buildings */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              height: '100%',
              alignItems: 'flex-end',
              padding: '20px',
              position: 'relative',
              zIndex: 1,
              gap: '10px',
            }}>
              {colors.map((color, index) => (
                <Building
                  key={index}
                  color={color}
                  height={heights[index]}
                  index={index}
                />
              ))}
            </div>

            {/* Water Surface */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '120px',
              background: 'linear-gradient(to bottom, rgba(52, 152, 219, 0.2), rgba(41, 128, 185, 0.1))',
              opacity: 0.4,
              backdropFilter: 'blur(4px)',
            }} />
          </div>

          <Text size="sm" color="dimmed" align="center">
            A cityscape visualization where building heights are influenced by the song's tempo ({audioFeatures.tempo.toFixed(0)} BPM) 
            and intensity ({(audioFeatures.rms * 100).toFixed(0)}%). Colors are derived from the audio analysis.
          </Text>
        </Stack>
      </Paper>

      {/* Musical Bookshelf */}
      <Paper p="md" radius="md" withBorder>
        <Stack spacing="lg">
          <Group position="apart" align="center">
            <Title order={3}>Musical Library</Title>
            <IconBooks size={24} style={{ color: colors[0] }} />
          </Group>
          
          <div style={{
            background: 'linear-gradient(to bottom, #2C3E50, #1a252f)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.2)',
          }}>
            <Bookshelf colors={colors} />
            <Bookshelf colors={colors} />
          </div>

          <Text size="sm" color="dimmed" align="center">
            A library visualization where book sizes and colors represent different aspects of the music's character.
            Each shelf displays a unique arrangement based on the audio's color palette.
          </Text>
        </Stack>
      </Paper>

      {/* Musical Parking Lot */}
      <Paper p="md" radius="md" withBorder>
        <Stack spacing="lg">
          <Group position="apart" align="center">
            <Title order={3}>Musical Parking</Title>
            <IconCar size={24} style={{ color: colors[0] }} />
          </Group>
          
          <div style={{
            background: 'linear-gradient(to bottom, #2C3E50, #1a252f)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.2)',
          }}>
            <ParkingLot colors={colors} />
          </div>

          <Text size="sm" color="dimmed" align="center">
            A parking lot visualization where each car represents a different aspect of the music's color palette,
            arranged in a structured grid to symbolize the organized nature of musical composition.
          </Text>
        </Stack>
      </Paper>

      {/* Record Collection */}
      <Paper p="md" radius="md" withBorder>
        <Stack spacing="lg">
          <Group position="apart" align="center">
            <Title order={3}>Record Collection</Title>
            <IconDisc size={24} style={{ color: colors[0] }} />
          </Group>
          
          <div style={{
            background: 'linear-gradient(to bottom, #2C3E50, #1a252f)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.2)',
          }}>
            <RecordShelf colors={colors} />
          </div>

          <Text size="sm" color="dimmed" align="center">
            A vinyl record collection where each record's color and size represents different aspects of the music's character,
            arranged to showcase the audio's unique color palette.
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default BrandStoryVisualizer; 