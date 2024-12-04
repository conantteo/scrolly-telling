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
  upsertElement: (data: ScrollyContainerElementProps) => void;
  setData: (id: string, data: ScrollyElementData) => void;
}

const NEW_ANIMATION: ScrollyContainerElementProps = {
  id: `0`,
  type: 'animation',
  isNew: true,
  isOpen: false,
};

const NEW_COMPONENT: ScrollyContainerElementProps = {
  id: `0`,
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
  removeElement: (id) => {
    const numericalId = Number(id);
    set((state) => {
      const updatedData = [...state.data];
      const updatedElements = [...state.elements];
      updatedData.splice(numericalId, 2);
      updatedElements.splice(numericalId, 2);
      const reorderedData = updatedData.map((item, index) => ({ ...item, id: `${index}` }));
      const reorderedElements = updatedElements.map((item, index) => ({ ...item, id: `${index}` }));
      return {
        data: reorderedData,
        elements: reorderedElements.length > 0 ? reorderedElements : [NEW_COMPONENT],
      };
    });
  },
  setData: (index, data) => {
    set((state) => {
      const updatedData = [...state.data];
      const indexToSet = Number(index) < 0 ? 0 : Number(index);
      updatedData[indexToSet] = data;
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
            element.type === 'animation'
              ? { ...NEW_COMPONENT, id: `${Number(updatedElements.length + 1)}` }
              : { ...NEW_ANIMATION, id: `${Number(updatedElements.length + 1)}` },
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
