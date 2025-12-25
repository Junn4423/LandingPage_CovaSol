'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import { loadFireworksPreset } from '@tsparticles/preset-fireworks';
import { loadConfettiPreset } from '@tsparticles/preset-confetti';
import type { Container, ISourceOptions, MoveDirection, OutMode } from '@tsparticles/engine';
import type { SeasonalTheme, SeasonalEffectType } from '@covasol/types';

interface SeasonalEffectsProps {
  theme: SeasonalTheme | null;
  disableOnMobile?: boolean;
}

// Custom snow effect component
interface Snowflake {
  id: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
  speedY: number;
  speedX: number;
}

function CustomSnowEffect() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    // Initialize snowflakes
    const initialFlakes: Snowflake[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      opacity: Math.random() * 0.35 + 0.25, // Reduced opacity by ~10%
      size: Math.random() * 20 + 15,
      speedY: Math.random() * 1 + 0.5,
      speedX: Math.random() * 0.5 - 0.25,
    }));
    setSnowflakes(initialFlakes);

    // Animation loop
    const animate = () => {
      setSnowflakes((prevFlakes) =>
        prevFlakes.map((flake) => {
          let newY = flake.y + flake.speedY;
          let newX = flake.x + flake.speedX;

          // Reset if off screen
          if (newY > window.innerHeight) {
            newY = -20;
            newX = Math.random() * window.innerWidth;
          }

          if (newX > window.innerWidth) {
            newX = 0;
          } else if (newX < 0) {
            newX = window.innerWidth;
          }

          return { ...flake, x: newX, y: newY };
        })
      );
    };

    const interval = setInterval(animate, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {snowflakes.map((flake) => (
        <p
          key={flake.id}
          className="snowflake"
          style={{
            opacity: flake.opacity,
            fontSize: `${flake.size}px`,
            transform: `translate3d(${flake.x}px, ${flake.y}px, 0px)`,
            position: 'absolute',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          ✲
        </p>
      ))}
    </>
  );
}

// Check if device is mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Generate particle options based on effect type
function getParticleOptions(effectType: SeasonalEffectType, theme: SeasonalTheme): ISourceOptions {
  const baseConfig: ISourceOptions = {
    fullScreen: { enable: false },
    detectRetina: true,
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: false },
        onClick: { enable: false },
      },
    },
  };

  switch (effectType) {
    case 'snow':
      return {
        ...baseConfig,
        particles: {
          number: { value: 50, density: { enable: true } },
          color: { value: '#ffffff' },
          shape: { type: 'circle' },
          opacity: { value: { min: 0.3, max: 0.8 } },
          size: { value: { min: 2, max: 6 } },
          move: {
            enable: true,
            speed: { min: 1, max: 3 },
            direction: 'bottom' as MoveDirection,
            straight: false,
            outModes: { default: 'out' as OutMode },
          },
          wobble: {
            enable: true,
            distance: 10,
            speed: 5,
          },
        },
      };

    case 'firework':
      return {
        ...baseConfig,
        background: {
          color: 'transparent',
        },
        particles: {
          number: { value: 0 },
          color: {
            value: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff6b6b', '#4ecdc4', '#ffe66d'],
          },
          shape: { type: 'circle' },
          opacity: {
            value: { min: 0.5, max: 1 },
            animation: { enable: true, speed: 0.5, startValue: 'max', destroy: 'min' },
          },
          size: {
            value: { min: 1, max: 3 },
          },
          move: {
            enable: true,
            speed: { min: 10, max: 25 },
            direction: 'none' as MoveDirection,
            outModes: { default: 'destroy' as OutMode },
            gravity: { enable: true, acceleration: 15 },
            decay: 0.05,
          },
          life: {
            duration: { value: { min: 0.5, max: 1.5 } },
            count: 1,
          },
        },
        emitters: [
          {
            position: { x: 50, y: 100 },
            rate: { quantity: 5, delay: 0.5 },
            life: { count: 0, duration: 0.1 },
            size: { width: 100, height: 0 },
            particles: {
              move: {
                direction: 'top' as MoveDirection,
                speed: { min: 30, max: 50 },
                outModes: { top: 'none' as OutMode, default: 'destroy' as OutMode },
              },
              opacity: { value: 1 },
              size: { value: 2 },
              life: {
                duration: { value: { min: 0.5, max: 1 } },
                count: 1,
              },
              shape: { type: 'line' },
              rotate: { value: 90 },
            },
          },
        ],
      };

    case 'petals':
      return {
        ...baseConfig,
        particles: {
          number: { value: 30, density: { enable: true } },
          color: { value: [theme.primaryColor, '#FFB7C5', '#FFDDD2'] },
          shape: {
            type: 'circle',
            options: {},
          },
          opacity: { value: { min: 0.4, max: 0.8 } },
          size: { value: { min: 4, max: 10 } },
          move: {
            enable: true,
            speed: { min: 1, max: 3 },
            direction: 'bottom-right' as MoveDirection,
            straight: false,
            outModes: { default: 'out' as OutMode },
          },
          rotate: {
            value: { min: 0, max: 360 },
            direction: 'random',
            animation: { enable: true, speed: 5 },
          },
        },
      };

    case 'hearts':
      return {
        ...baseConfig,
        particles: {
          number: { value: 20, density: { enable: true } },
          color: { value: [theme.primaryColor, '#FF6B6B', '#FF8E8E'] },
          shape: { type: 'heart' },
          opacity: { value: { min: 0.5, max: 0.9 } },
          size: { value: { min: 8, max: 16 } },
          move: {
            enable: true,
            speed: { min: 2, max: 5 },
            direction: 'top' as MoveDirection,
            straight: false,
            outModes: { default: 'out' as OutMode },
          },
        },
      };

    case 'confetti':
      return {
        ...baseConfig,
        preset: 'confetti',
        background: {
          color: 'transparent',
        },
        emitters: {
          position: { x: 50, y: 0 },
          rate: { quantity: 5, delay: 0.3 },
        },
      };

    case 'leaves':
      return {
        ...baseConfig,
        particles: {
          number: { value: 25, density: { enable: true } },
          color: { value: ['#D97706', '#EA580C', '#92400E', '#78350F'] },
          shape: { type: 'circle' },
          opacity: { value: { min: 0.5, max: 0.9 } },
          size: { value: { min: 6, max: 12 } },
          move: {
            enable: true,
            speed: { min: 1, max: 3 },
            direction: 'bottom-right' as MoveDirection,
            straight: false,
            outModes: { default: 'out' as OutMode },
          },
          rotate: {
            value: { min: 0, max: 360 },
            animation: { enable: true, speed: 3 },
          },
        },
      };

    case 'lanterns':
      return {
        ...baseConfig,
        particles: {
          number: { value: 8, density: { enable: true } },
          color: { value: ['#F97316', '#FBBF24', '#DC2626'] },
          shape: { type: 'circle' },
          opacity: { value: { min: 0.7, max: 1 } },
          size: { value: { min: 15, max: 25 } },
          move: {
            enable: true,
            speed: { min: 0.3, max: 0.8 },
            direction: 'top' as MoveDirection,
            straight: false,
            outModes: { default: 'out' as OutMode },
          },
          glow: {
            enable: true,
            color: { value: '#F97316' },
            distance: 10,
            strength: 0.5,
          },
        },
      };

    case 'bats':
      return {
        ...baseConfig,
        particles: {
          number: { value: 5, density: { enable: true } },
          color: { value: '#1a1a1a' },
          shape: { type: 'circle' },
          opacity: { value: 0.9 },
          size: { value: { min: 8, max: 15 } },
          move: {
            enable: true,
            speed: { min: 3, max: 8 },
            direction: 'right' as MoveDirection,
            straight: false,
            outModes: { default: 'out' as OutMode },
          },
          wobble: {
            enable: true,
            distance: 20,
            speed: 10,
          },
        },
      };

    case 'bubbles':
      return {
        ...baseConfig,
        particles: {
          number: { value: 20, density: { enable: true } },
          color: { value: ['#60A5FA', '#34D399', '#A78BFA'] },
          shape: { type: 'circle' },
          opacity: { value: { min: 0.3, max: 0.6 } },
          size: { value: { min: 5, max: 20 } },
          move: {
            enable: true,
            speed: { min: 1, max: 3 },
            direction: 'top' as MoveDirection,
            straight: false,
            outModes: { default: 'out' as OutMode },
          },
        },
      };

    case 'stars':
      return {
        ...baseConfig,
        particles: {
          number: { value: 30, density: { enable: true } },
          color: { value: ['#FBBF24', '#FDE047', '#FFFFFF'] },
          shape: { type: 'star' },
          opacity: { value: { min: 0.3, max: 1 }, animation: { enable: true, speed: 0.5, startValue: 'min', sync: false } },
          size: { value: { min: 2, max: 6 } },
          move: {
            enable: true,
            speed: { min: 0.2, max: 0.5 },
            direction: 'none' as MoveDirection,
            outModes: { default: 'bounce' as OutMode },
          },
          twinkle: {
            particles: { enable: true, frequency: 0.05, opacity: 1 },
          },
        },
      };

    case 'lixi':
      return {
        ...baseConfig,
        particles: {
          number: { value: 15, density: { enable: true } },
          color: { value: '#DC2626' },
          shape: { type: 'square' },
          opacity: { value: { min: 0.7, max: 1 } },
          size: { value: { min: 10, max: 18 } },
          move: {
            enable: true,
            speed: { min: 2, max: 4 },
            direction: 'bottom' as MoveDirection,
            straight: false,
            outModes: { default: 'out' as OutMode },
          },
          rotate: {
            value: { min: -15, max: 15 },
            animation: { enable: true, speed: 2 },
          },
        },
      };

    default:
      return baseConfig;
  }
}

export function SeasonalEffects({ theme, disableOnMobile = true }: SeasonalEffectsProps) {
  const [init, setInit] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // Load full tsparticles with all features
      await loadFull(engine);
      // Load presets
      await loadFireworksPreset(engine);
      await loadConfettiPreset(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = useCallback(async (container?: Container): Promise<void> => {
    // Optional: log when particles are loaded
  }, []);

  const options = useMemo(() => {
    if (!theme || !theme.effectType || theme.effectType === 'none') {
      return null;
    }
    return getParticleOptions(theme.effectType, theme);
  }, [theme]);

  // Don't render if:
  // - Not initialized
  // - No theme or effect
  // - Effect is disabled
  // - On mobile and disableOnMobile is true
  if (!theme || !theme.effectEnabled) return null;
  if (!theme.effectType || theme.effectType === 'none') return null;
  if (isMobile && (disableOnMobile || theme.disableOnMobile)) return null;

  // Use custom snow effect for 'snow' type
  if (theme.effectType === 'snow') {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-[9998]"
        aria-hidden="true"
        style={{ isolation: 'isolate', overflow: 'hidden' }}
      >
        <CustomSnowEffect />
      </div>
    );
  }

  // For other effects, use particles
  if (!init) return null;
  if (!options) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9998]"
      aria-hidden="true"
      style={{ isolation: 'isolate' }}
    >
      <Particles
        id="seasonal-particles"
        particlesLoaded={particlesLoaded}
        options={options}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

export default SeasonalEffects;
