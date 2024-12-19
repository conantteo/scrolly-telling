import _ from 'lodash';
import { create } from 'zustand';
import { ScrollyContainerElementProps, ScrollyPage } from '../types';

interface ScrollyState {
  currentElementId: string | null;
  setCurrentElementId: (id: string | null) => void;
  elements: ScrollyContainerElementProps[];
  removeElement: (id: string) => void;
  setElement: (id: string, data: ScrollyContainerElementProps) => void;
  appendDefaultElement: () => void;
  pages: ScrollyPage[];
  removeComponentFromFrame: (pageIndex: string, frameIndex: number, componentIndex: number) => void;
  setPage: (pageIndex: string, data: ScrollyPage) => void;
}

const INITIAL_COMPONENT: ScrollyContainerElementProps = {
  id: `0`,
  isNew: true,
};

export const useScrollyStore = create<ScrollyState>((set) => ({
  elements: [INITIAL_COMPONENT],
  pages: [],
  currentElementId: null,
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
      return { pages: updatedData };
    });
  },
  removeComponentFromFrame: (pageIndex, frameIndex, componentIndex) => {
    set((state) => {
      const updatedData = _.cloneDeep(state.pages);
      const indexToSet = Number(pageIndex) < 0 ? 0 : Number(pageIndex);
      if (frameIndex >= 0) {
        const frame = updatedData[indexToSet].frames[frameIndex];
        frame.components.splice(componentIndex, 1);
        return { pages: updatedData };
      }
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
      const updatedElemenets = _.cloneDeep(state.elements);
      updatedElemenets.push({ ...INITIAL_COMPONENT, id: `${updatedElemenets.length}` });
      return { elements: updatedElemenets };
    });
  },
}));
