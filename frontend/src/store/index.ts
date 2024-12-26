import _, { isNumber } from 'lodash';
import { create } from 'zustand';
import {
  ScrollyComponent,
  ScrollyContainerElementProps,
  ScrollyFocusElement,
  ScrollyPage,
} from '../types';

interface ScrollyState {
  currentElementId: string | null;
  setCurrentElementId: (id: string | null) => void;
  elements: ScrollyContainerElementProps[];
  removeElement: (id: string) => void;
  setElement: (id: string, data: ScrollyContainerElementProps) => void;
  appendDefaultElement: () => void;
  pages: ScrollyPage[];
  setPage: (pageIndex: string, data: ScrollyPage) => void;
  currentScrollyFocusElement: ScrollyFocusElement | null;
  setScrollyFocusElement: (component: ScrollyComponent | null) => void;
}

const INITIAL_COMPONENT: ScrollyContainerElementProps = {
  id: `0`,
  isNew: true,
};

export const useScrollyStore = create<ScrollyState>((set) => ({
  elements: [INITIAL_COMPONENT],
  pages: [],
  currentElementId: null,
  currentScrollyFocusElement: null,
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
      return { pages: updatedData };
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
