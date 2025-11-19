import type { ComponentType, ReactNode } from 'react';

export type WindowSize = {
  width: number;
  height?: number;
};

export type WindowDescriptor = {
  title: string;
  subtitle?: string;
  Component: ComponentType<any>;
  size: WindowSize;
  initialPosition?: {
    x: number;
    y: number;
  };
};

export type PortfolioIcon = {
  id: string;
  label: string;
  description?: string;
  icon: ReactNode;
  accentColor: string;
  window: WindowDescriptor;
};

export type WindowInstance = {
  itemId: string;
  position: {
    x: number;
    y: number;
  };
  zIndex: number;
  sizeOverride?: WindowSize;
  isMinimized: boolean;
  isMaximized: boolean;
  restoreState?: {
    position: {
      x: number;
      y: number;
    };
    sizeOverride?: WindowSize;
  };
};

export type WindowWithDescriptor = PortfolioIcon & {
  instance: WindowInstance;
};

