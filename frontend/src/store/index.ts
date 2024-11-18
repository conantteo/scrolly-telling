import { create } from 'zustand';
import { ScrollyContainerElementProps, ScrollyElementData } from '../types';

interface ScrollyState {
  elements: ScrollyContainerElementProps[];
  data: ScrollyElementData[];
  isAnimationWindowOpen: boolean;
  isComponentWindowOpen: boolean;
  currentElementId: string;
  removeElement: (id: string) => void;
  setViewElement: (id: string, isOpen: boolean) => void;
  upsertData: (data: ScrollyElementData) => void;
  upsertElement: (data: ScrollyContainerElementProps) => void;
}

const NEW_ANIMATION: ScrollyContainerElementProps = {
  id: `-1`,
  type: 'animation',
  isNew: true,
  isOpen: false,
};

const NEW_COMPONENT: ScrollyContainerElementProps = {
  id: `-1`,
  type: 'component',
  isNew: true,
  isOpen: false,
};

export const useScrollyStore = create<ScrollyState>((set) => ({
  elements: [NEW_COMPONENT],
  data: [],
  isAnimationWindowOpen: false,
  isComponentWindowOpen: false,
  currentElementId: '',
  setViewElement: (id, isOpen) => {
    set((state) => {
      let isAnimationOpen = state.isAnimationWindowOpen;
      let isComponentOpen = state.isComponentWindowOpen;
      const updatedElements = state.elements.map((e) => {
        if (e.id === id) {
          if (e.type === 'animation') {
            isAnimationOpen = isOpen;
            return { ...e, isOpen: isAnimationOpen };
          } else if (e.type === 'component') {
            isComponentOpen = isOpen;
            return { ...e, isOpen: isComponentOpen };
          }
        }
        return { ...e };
      });
      return {
        elements: updatedElements,
        isAnimationWindowOpen: isAnimationOpen,
        isComponentWindowOpen: isComponentOpen,
        currentElementId: isOpen ? id : '',
      };
    });
  },
  removeElement: (id) =>
    set((state) => {
      const newElements = [...state.elements];
      newElements.pop();
      const elementIndex = newElements.findIndex((element) => element.id === id);
      if (elementIndex !== -1) {
        const deletedElements = newElements.splice(elementIndex, 2);
        const deletedIds = deletedElements.map((element) => element.id);
        const updatedData = [...state.data].filter((d) => !deletedIds.includes(d.id));
        const orderedData = updatedData.map((item, idx) => ({ ...item, id: `${idx}` }));

        const sortedElements = newElements.sort((a, b) => Number(a.id) - Number(b.id));
        const orderedElements = sortedElements.map((item, idx) => ({ ...item, id: String(idx) }));
        const lastElement = orderedElements[orderedElements.length - 1];
        orderedElements.push(
          lastElement && lastElement.type === 'component' ? NEW_ANIMATION : NEW_COMPONENT
        );

        return { elements: orderedElements, data: orderedData };
      }
      return { elements: state.elements, data: state.data };
    }),
  upsertData: (data) => {
    set((state) => {
      const updatedData = [...state.data];
      const dataIds = updatedData.map((data) => data.id);
      if (!dataIds.includes(data.id)) {
        return { data: [...updatedData, { ...data, id: `${updatedData.length}` }] };
      }
      const existingDataIndex = state.data.findIndex((d) => d.id === data.id);
      updatedData[existingDataIndex] = data;
      return { data: updatedData };
    });
  },
  upsertElement: (element) => {
    set((state) => {
      const updatedElements = [...state.elements];
      if (element.isNew) {
        updatedElements.pop();
        return {
          elements: [
            ...updatedElements,
            {
              ...element,
              isNew: false,
              isOpen: false,
              id: `${updatedElements.length}`,
            },
            element.type === 'animation' ? NEW_COMPONENT : NEW_ANIMATION,
          ],
        };
      }
      const existingElementIndex = state.elements.findIndex((e) => e.id === element.id);
      if (existingElementIndex !== -1) {
        updatedElements[existingElementIndex] = { ...element, isOpen: false };
        return { elements: updatedElements };
      }
      return { elements: state.elements };
    });
  },
}));
