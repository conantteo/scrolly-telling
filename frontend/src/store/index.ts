import _, { isNumber } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import {
  ScrollyComponent,
  ScrollyContainerElementProps,
  ScrollyFocusElement,
  ScrollyPage,
} from '../types';
import {
  setArticleFromLocalStorage,
  uploadArticalIntoRemoteStorage,
} from '../util/localStorageUtil';

interface ScrollyState {
  currentElementId: string | null;
  setCurrentElementId: (id: string | null) => void;
  elements: ScrollyContainerElementProps[];
  removeElement: (id: string) => void;
  setElement: (id: string, data: ScrollyContainerElementProps) => void;
  appendDefaultElement: () => void;
  pages: ScrollyPage[];
  setPage: (pageIndex: string, data: ScrollyPage) => void;
  setPages: (pages: ScrollyPage[]) => void;
  currentScrollyFocusElement: ScrollyFocusElement | null;
  setScrollyFocusElement: (component: ScrollyComponent | null) => void;
  articleId: string;
  setArticleId: (id: string) => void;
  articleTitle: string;
  setArticleTitle: (id: string) => void;
  resetStore: () => void;
}

const INITIAL_COMPONENT: ScrollyContainerElementProps = {
  id: `0`,
  isNew: true,
};

export const useScrollyStore = create<ScrollyState>((set) => ({
  articleId: '',
  articleTitle: '',
  elements: [INITIAL_COMPONENT],
  pages: [],
  currentElementId: null,
  currentScrollyFocusElement: null,
  resetStore: () => {
    set(() => {
      const articleId = uuidv4();
      setArticleFromLocalStorage({
        articleId,
      });
      return {
        articleId,
        articleTitle: '',
        elements: [INITIAL_COMPONENT],
        pages: [],
        currentElementId: null,
        currentScrollyFocusElement: null,
      };
    });
  },
  setArticleTitle: (title) => {
    set(() => {
      setArticleFromLocalStorage({
        title,
      });
      return {
        articleTitle: title,
      };
    });
  },
  setArticleId: (id) => {
    set(() => {
      setArticleFromLocalStorage({
        articleId: id,
      });
      return {
        articleId: id,
      };
    });
  },
  setCurrentElementId: (id) => {
    set(() => {
      return {
        currentElementId: id,
      };
    });
  },
  removeElement: (id) => {
    const numericalId = Number(id);
    set((state) => {
      const updatedData = _.cloneDeep(state.pages);
      const updatedElements = _.cloneDeep(state.elements);
      updatedData.splice(numericalId, 1);
      updatedElements.splice(numericalId, 1);
      const reorderedData = updatedData.map((item, index) => ({ ...item, id: `${index}` }));
      const reorderedElements = updatedElements.map((item, index) => ({ ...item, id: `${index}` }));
      setArticleFromLocalStorage({
        pages: reorderedData,
      });
      return {
        pages: reorderedData,
        elements: reorderedElements.length > 0 ? reorderedElements : [INITIAL_COMPONENT],
      };
    });
  },
  setPage: (pageIndex, page) => {
    set((state) => {
      const updatedData = _.cloneDeep(state.pages);
      const indexToSet = Number(pageIndex) < 0 ? 0 : Number(pageIndex);
      updatedData[indexToSet] = page;
      updatedData.forEach((page, pageIndex) => {
        page.frames.forEach((frame, frameIndex) => {
          frame.pageIndex = pageIndex;
          frame.components.forEach((component) => {
            component.pageIndex = pageIndex;
            component.frameIndex = frameIndex;
          });
        });
      });
      setArticleFromLocalStorage({
        pages: updatedData,
      });
      uploadArticalIntoRemoteStorage({
        pages: updatedData,
      });
      return { pages: updatedData };
    });
  },
  setPages: (pages) => {
    set(() => {
      const updatedData = _.cloneDeep(pages);
      const updatedElements: ScrollyContainerElementProps[] = _.cloneDeep(pages).map((data) => ({
        ...data,
        isNew: false,
      }));
      updatedElements.push({ ...INITIAL_COMPONENT, id: `${updatedElements.length}` });
      return { pages: updatedData, elements: updatedElements };
    });
  },
  setElement: (index, data) => {
    set((state) => {
      const updatedElement = _.cloneDeep(state.elements);
      const indexToSet = Number(index) < 0 ? 0 : Number(index);
      updatedElement[indexToSet] = data;
      return { elements: updatedElement };
    });
  },
  appendDefaultElement: () => {
    set((state) => {
      const updatedElements = _.cloneDeep(state.elements);
      updatedElements.push({ ...INITIAL_COMPONENT, id: `${updatedElements.length}` });
      return { elements: updatedElements };
    });
  },
  setScrollyFocusElement: (component) => {
    set((state) => {
      const updatedFocusElement = _.cloneDeep(state.currentScrollyFocusElement);
      if (component === null) {
        return { currentScrollyFocusElement: null };
      } else if (component && isNumber(component.pageIndex) && isNumber(component.frameIndex)) {
        return {
          currentScrollyFocusElement: {
            ...updatedFocusElement,
            pageIndex: component.pageIndex ?? 0,
            frameIndex: component.frameIndex ?? 0,
          },
        };
      }
      return state;
    });
  },
}));
