export interface ScrollyContainerElementProps {
  id: string;
  isNew: boolean;
}

export type ScrollyComponent = {
  id: string;
  type: 'component';
  metadata: {
    position: 'center' | 'left' | 'right';
    [key: string]: string | number | boolean;
    // content?: string;
    // fileBase64?: string,
    // fileName?: string,
    // fileExtension?: string,
    // fileSize?: string,
  };
  animation: ScrollyAnimation | null;
};

export type ScrollyAnimation = {
  id: string;
  type: 'animation';
  metadata: {
    transition: string;
    duration: number;
    pin: boolean;
    [key: string]: string | number | boolean;
    // pinnedSectionId?: string;
    // _pinnedContainer?: string;
    // _animation?: 'tween' | 'timeline'
    // _start?: string;
    // _end?: string;
  };
};

export const ANIMATION_TYPES = [
  'fade',
  'fade-up',
  'fade-down',
  'fade-left',
  'fade-right',
  'scale',
  'scale-y',
  'scale-x',
  'skew-up',
  'skew-down',
  'rotate-left',
  'rotate-right',
  'slide-down',
  'slide-up',
  'slide-left',
  'slide-right',
  'pop',
  'pop-bottom-left',
  'pop-bottom-right',
  'pop-top-left',
  'pop-top-right',
];
