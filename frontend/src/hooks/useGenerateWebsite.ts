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
        contentHtml: component.type === 'text' ? component.metadata?.htmlContent : undefined,
      }));
      return { ...frame, components: updatedComponents, id: `${pageIndex}-${frameIndex}` };
    });
    return { ...page, frames: updatedFrames, id: `${pageIndex}` };
  });
  return { ...updatedData, pages: updatedPages };
};

export const useGenerateAndDownloadWebsite = () => {
  return useMutation<Blob, Error, PostWebsiteRequest>({
    mutationFn: async (data: PostWebsiteRequest) => {
      const dataForPost = prepareDataForPost(data);
      const server_url = import.meta.env.VITE_SERVER_URL ? import.meta.env.VITE_SERVER_URL : "http://localhost:8001"
      const response = await axios.post<Blob>(
        `${server_url}/api/generate-website`,
        dataForPost,
        {
          params: { is_download: true },
          responseType: 'blob',
        }
      );
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = data.articleId;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return response.data;
    },
  });
};

export const useGenerateAndPreviewWebsite = () => {
  return useMutation<PostWebsiteResponse, Error, PostWebsiteRequest>({
    mutationFn: async (data: PostWebsiteRequest) => {
      const dataForPost = prepareDataForPost(data);
      const server_url = import.meta.env.VITE_SERVER_URL ? import.meta.env.VITE_SERVER_URL : "http://localhost:8001"
      const response = await axios.post<PostWebsiteResponse>(
        `${server_url}/api/generate-website`,
        dataForPost,
        {
          params: { is_download: false },
        }
      );

      window.open(response.data.url, '_blank', 'noopener,noreferrer');
      return response.data;
    },
  });
};
