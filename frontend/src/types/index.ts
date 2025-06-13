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

export const LEFT_RIGHT = 'left-right';
export const TOP_BOTTOM = 'top-bottom';
export const SINGLE = 'single';

export type ScrollyLayout = {
  template: typeof LEFT_RIGHT | typeof TOP_BOTTOM | typeof SINGLE;
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
} & (ScrollyImageComponent | ScrollyRichTextComponent | ScrollyHtmlComponent);

export type ScrollyImageComponent = {
  type: 'image';
  metadata?: ScrollyImage;
};

export type ScrollyRichTextComponent = {
  type: 'text';
  metadata?: ScrollyRichText;
};

export type ScrollyHtmlComponent = {
  type: 'html';
  metadata?: ScrollyHtml;
};

export type ScrollyComponentMetadata = ScrollyRichText | ScrollyImage;

export type ScrollyRichText = {
  htmlContent: string;
};

export type ScrollyImage = {
  fileBase64?: string;
  image?: string;
  caption?: string;
  fileSize?: string;
  file?: File;
  isDisplayFullscreen?: boolean;
};

export type ScrollyHtml = {
  htmlFile?: File;
  cssFile?: File;
  html?: string;
  htmlFileBase64?: string;
  htmlFileSize?: string;
  css?: string;
  cssFileBase64?: string;
  cssFileSize?: string;
};

export type ScrollyFocusElement = {
  pageIndex: number;
  frameIndex: number;
};
