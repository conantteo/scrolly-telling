import { ReactNode } from 'react';

export interface ScrollyAnimationData {
  id: string;
  type: 'animation';
  metadata: {
    [key: string]: string;
  };
}

export interface ScrollyComponentData {
  id: string;
  type: 'component';
  metadata: {
    [key: string]: string;
  };
}

export type ScrollyElementData = ScrollyAnimationData | ScrollyComponentData;

export interface ScrollyAnimation {
  id: string;
  type: 'animation';
  component: ReactNode;
}

export interface ScrollyComponent {
  id: string;
  type: 'component';
  component: ReactNode;
}

export type ScrollyElement = ScrollyAnimation | ScrollyComponent;

export interface ScrollyContainerElementProps {
  id: string;
  type: 'animation' | 'component';
  isOpen: boolean;
  isNew: boolean;
}
