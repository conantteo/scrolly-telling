import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

// Define the API endpoint
const postWebsite = async (data: { title: string; scroll_trigger: boolean }) => {
  const response = await axios.post('http://localhost:8000/api/generate-website', data);
  return response.data;
};

// Use React Query's mutation hook for POST requests
export const usePostWebsite = () => {
  return useMutation(postWebsite);
};
