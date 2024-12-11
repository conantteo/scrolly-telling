import { create } from 'zustand';
import { ScrollyComponent, ScrollyContainerElementProps, ScrollyPage } from '../types';

interface ScrollyState {
  currentElementId: string | null;
  setCurrentElementId: (id: string | null) => void;
  elements: ScrollyContainerElementProps[];
  removeElement: (id: string) => void;
  setElement: (id: string, data: ScrollyContainerElementProps) => void;
  appendDefaultElement: () => void;
  data: ScrollyPage[];
  addDataToComponentGroup: (id: string, data: ScrollyComponent) => void;
  setData: (id: string, data: ScrollyPage) => void;
}

const INITIAL_COMPONENT: ScrollyContainerElementProps = {
  id: `0`,
  isNew: true,
};

export const useScrollyStore = create<ScrollyState>((set) => ({
  elements: [INITIAL_COMPONENT],
  data: [],
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
      const updatedData = [...state.data];
      const updatedElements = [...state.elements];
      updatedData.splice(numericalId, 1);
      updatedElements.splice(numericalId, 1);
      const reorderedData = updatedData.map((item, index) => ({ ...item, id: `${index}` }));
      const reorderedElements = updatedElements.map((item, index) => ({ ...item, id: `${index}` }));
      return {
        data: reorderedData,
        elements: reorderedElements.length > 0 ? reorderedElements : [INITIAL_COMPONENT],
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
  addDataToComponentGroup: (index, data) => {
    set((state) => {
      const updatedData = [...state.data];
      const indexToSet = Number(index) < 0 ? 0 : Number(index);
      updatedData[indexToSet] = {
        ...updatedData[indexToSet],
        components: [...updatedData[indexToSet].components, data],
      };
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
  appendDefaultElement: () => {
    set((state) => {
      const updatedElemenets = [...state.elements];
      updatedElemenets.push({ ...INITIAL_COMPONENT, id: `${updatedElemenets.length}` });
      return { elements: updatedElemenets };
    });
  },
}));
