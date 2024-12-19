import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import _ from 'lodash';
import { ScrollyPage } from '../types';

interface PostWebsiteRequest {
  articleId: string;
  title: string;
  pages: ScrollyPage[];
}

interface PostWebsiteResponse {
  id: string;
  url: string;
}

const setIdInData = (data: PostWebsiteRequest) => {
  const updatedData = _.cloneDeep(data);
  const updatedDataWithId = updatedData.pages.map((page, pageIndex) => {
    const updatedPage = page.frames.map((frame, frameIndex) => {
      const updatedFrame = frame.components.map((component, componentIndex) => ({
        ...component,
        id: `${pageIndex}-${frameIndex}-${componentIndex}`,
      }));
      return { ...updatedFrame, id: `${pageIndex}-${frameIndex}` };
    });
    return { ...updatedPage, id: `${pageIndex}` };
  });
  return updatedDataWithId;
};

// Use React Query's mutation hook for POST requests
export const useGenerateWebsite = () => {
  return useMutation<PostWebsiteResponse, Error, PostWebsiteRequest>({
    mutationFn: async (data: PostWebsiteRequest) => {
      const dataForPost = setIdInData(data);
      const response = await axios.post<PostWebsiteResponse>(
        'http://localhost:8001/api/generate-website',
        dataForPost
      );
      return response.data;
    },
  });
};
