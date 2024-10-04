import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface PostWebsiteRequest {
  title: string;
  scroll_trigger: boolean;
}

interface PostWebsiteResponse {
  title: string;
  scroll_trigger: boolean;
}

// Use React Query's mutation hook for POST requests
const usePostWebsite = () => {
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
