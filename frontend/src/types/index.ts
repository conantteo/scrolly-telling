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
  id: string;
  pinnable: boolean;
  layout: ScrollyLayout;
  frames: ScrollyFrame[];
};

export type ScrollyLayout = {
  template: 'left-right' | 'top-bottom' | 'single';
};

export type ScrollyFrame = {
  id: string;
  components: ScrollyComponent[];
  pageIndex?: number;
};

export type Positions = 'center' | 'left' | 'right' | 'top' | 'bottom';

export type ScrollyComponent = {
  id: string;
  position: Positions;
  animation: string;
  pageIndex?: number;
  frameIndex?: number;
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
  image: string;
  fileExtension: string;
  fileSize: string;
  file: File;
};

export type ScrollyFocusElement = {
  pageIndex: number;
  frameIndex: number;
};
