export interface ScrollyContainerElementProps {
  id: string;
  isNew: boolean;
}

export type ScrollyArticle = {
  id: string;
  title: string;
  pages: ScrollyPage[];
};

export type ScrollyPage = {
  pinnable: boolean;
  layout: ScrollyLayout;
  componentGroups: {
    components: ScrollyComponent[];
  }[];
};

export type ScrollyLayout = {
  template: string;
  heightTop?: string;
  widthLeft?: WIDTH_TYPES;
  heightBottom?: string;
  widthRight?: WIDTH_TYPES;
};

export type ScrollyComponent = {
  id: string;
  position: 'center' | 'left' | 'right';
  animation: ScrollyAnimation | null;
} & (ScrollyImageComponent | ScrollyRichTextComponent);

export type ScrollyImageComponent = {
  type: 'image';
  metadata?: ScrollyImage;
};

export type ScrollyRichTextComponent = {
  type: 'text';
  metadata?: ScrollyRichText;
};

export type ScrollyComponentMetadata = ScrollyRichText | ScrollyImage;

export type ScrollyRichText = {
  htmlContent: string;
};

export type ScrollyImage = {
  fileBase64: string;
  fileName: string;
  fileExtension: string;
  fileSize: string;
};

export type ScrollyAnimation = {
  id: string;
  type: 'fade-in' | 'overlap' | 'slide-up';
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

export type WIDTH_TYPES = '25%' | '50%' | '75%' | '100%';

export const ANIMATION_TYPES = [
  'fade-in',
  'overlap',
  // 'fade-up',
  // 'fade-down',
  // 'fade-left',
  // 'fade-right',
  // 'scale',
  // 'scale-y',
  // 'scale-x',
  // 'skew-up',
  // 'skew-down',
  // 'rotate-left',
  // 'rotate-right',
  // 'slide-down',
  'slide-up',
  // 'slide-left',
  // 'slide-right',
  // 'pop',
  // 'pop-bottom-left',
  // 'pop-bottom-right',
  // 'pop-top-left',
  // 'pop-top-right',
];
