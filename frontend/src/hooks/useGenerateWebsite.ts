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

const prepareDataForPost = (data: PostWebsiteRequest) => {
  const updatedData = _.cloneDeep(data);
  const updatedPages = updatedData.pages.map((page, pageIndex) => {
    const updatedFrames = page.frames.map((frame, frameIndex) => {
      const updatedComponents = frame.components.map((component, componentIndex) => ({
        ...component,
        id: `${pageIndex}-${frameIndex}-${componentIndex}`,
        image: component.type === 'image' ? component.metadata?.image : undefined,
        htmlContent: component.type === 'text' ? component.metadata?.htmlContent : undefined,
      }));
      return { ...frame, components: updatedComponents, id: `${pageIndex}-${frameIndex}` };
    });
    return { ...page, frames: updatedFrames, id: `${pageIndex}` };
  });
  return { ...updatedData, pages: updatedPages };
};

export const useGenerateWebsite = () => {
  return useMutation<PostWebsiteResponse, Error, PostWebsiteRequest>({
    mutationFn: async (data: PostWebsiteRequest) => {
      const dataForPost = prepareDataForPost(data);
      const response = await axios.post<PostWebsiteResponse>(
        'http://localhost:8001/api/generate-website',
        dataForPost
      );
      return response.data;
    },
  });
};
