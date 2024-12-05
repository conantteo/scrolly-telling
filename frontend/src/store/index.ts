import { create } from 'zustand';
import { ScrollyContainerElementProps, ScrollyElementData } from '../types';

interface ScrollyState {
  elements: ScrollyContainerElementProps[];
  data: ScrollyElementData[];
  currentElementId: string;
  removeElement: (id: string) => void;
  setViewElement: (id: string, isOpen: boolean) => void;
  setElement: (id: string, data: ScrollyContainerElementProps) => void;
  upsertElement: (data: ScrollyContainerElementProps) => void;
  setData: (id: string, data: ScrollyElementData) => void;
  appendElement: () => void;
}

const NEW_COMPONENT: ScrollyContainerElementProps = {
  id: `0`,
  type: 'component',
  isNew: true,
  isOpen: false,
};

export const useScrollyStore = create<ScrollyState>((set) => ({
  elements: [NEW_COMPONENT],
  data: [],
  currentElementId: '',
  setViewElement: (id, isOpen) => {
    set((state) => {
      const updatedElements = state.elements.map((e) => {
        if (e.id === id) {
          return { ...e, isOpen };
        }
        return { ...e, isOpen: false };
      });
      return {
        elements: updatedElements,
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
  setElement: (index, data) => {
    set((state) => {
      const updatedElement = [...state.elements];
      const indexToSet = Number(index) < 0 ? 0 : Number(index);
      updatedElement[indexToSet] = data;
      return { elements: updatedElement };
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
  appendElement: () => {
    set((state) => {
      const updatedElemenets = [...state.elements];
      updatedElemenets.push({ ...NEW_COMPONENT, id: `${updatedElemenets.length}` });
      return { elements: updatedElemenets };
    });
  },
}));
