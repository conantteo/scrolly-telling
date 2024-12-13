import _ from 'lodash';
import { create } from 'zustand';
import { ScrollyComponent, ScrollyContainerElementProps, ScrollyPage } from '../types';

interface ScrollyState {
  currentElementId: string | null;
  setCurrentElementId: (id: string | null) => void;
  elements: ScrollyContainerElementProps[];
  removeElement: (id: string) => void;
  setElement: (id: string, data: ScrollyContainerElementProps) => void;
  appendDefaultElement: () => void;
  pages: ScrollyPage[];
  // setComponentInFrame: (
  //   pageIndex: string,
  //   frameIndex: number,
  //   componentIndex: number,
  //   data: ScrollyComponent
  // ) => void;
  addComponentToFrame: (pageIndex: string, frameIndex: number, data: ScrollyComponent) => void;
  removeComponentFromFrame: (pageIndex: string, frameIndex: number, componentIndex: number) => void;
  // setAnimationInComponent: (
  //   pageIndex: string,
  //   frameIndex: number,
  //   componentIndex: number,
  //   data: { [key: string]: string | number | boolean }
  // ) => void;
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
  // setComponentInFrame: (pageIndex, frameIndex, componentIndex, component) => {
  //   set((state) => {
  //     const updatedData = [...state.pages];
  //     const indexToSet = Number(pageIndex) < 0 ? 0 : Number(pageIndex);
  //     if (updatedData[indexToSet] && frameIndex >= 0 && componentIndex >= 0) {
  //       updatedData[indexToSet].frames[frameIndex].components[componentIndex] = component;
  //       return { pages: updatedData };
  //     }
  //     return state;
  //   });
  // },
  addComponentToFrame: (pageIndex, frameIndex, component) => {
    set((state) => {
      const updatedData = _.cloneDeep(state.pages);
      const indexToSet = Number(pageIndex) < 0 ? 0 : Number(pageIndex);
      if (frameIndex >= 0) {
        const frame = updatedData[indexToSet].frames[frameIndex];
        frame.components.push(component);
        return { pages: updatedData };
      }
      return state;
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
  // setAnimationInComponent: (pageIndex, frameIndex, componentIndex, animationData) => {
  //   set((state) => {
  //     const updatedData = [...state.pages];
  //     const indexToSet = Number(pageIndex) < 0 ? 0 : Number(pageIndex);
  //     if (frameIndex >= 0 && componentIndex >= 0) {
  //       const component = updatedData[indexToSet].frames[frameIndex].components[componentIndex];
  //       if (component.animation) {
  //         const updatedComponent = {
  //           ...component,
  //           animation: {
  //             ...component.animation,
  //             metadata: { ...component.animation?.metadata, ...animationData },
  //           },
  //         };
  //         updatedData[indexToSet].frames[frameIndex].components[componentIndex] = updatedComponent;
  //         return { pages: updatedData };
  //       }
  //       return state;
  //     }
  //     return state;
  //   });
  // },
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
