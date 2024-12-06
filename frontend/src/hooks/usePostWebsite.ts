import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { ScrollyComponent } from '../types';

interface PostWebsiteRequest {
  id: string;
  data: ScrollyComponent[];
}

interface PostWebsiteResponse {
  id: string;
  url: string;
}

// Use React Query's mutation hook for POST requests
export const usePostWebsite = () => {
  return useMutation<PostWebsiteResponse, Error, PostWebsiteRequest>({
    mutationFn: async (data: PostWebsiteRequest) => {
      const response = await axios.post<PostWebsiteResponse>(
        'https://your-api-endpoint.com/websites',
        data
      );
      return response.data; // Ensure this is returning a Promise
    },
  });
};
