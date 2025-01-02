import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const ANIMATION_OPTIONS_FALLBACK = ['overlap', 'fade'];

const getAnimationOptions = async () => {
  const server_url = import.meta.env.VITE_SERVER_URL ? import.meta.env.VITE_SERVER_URL : "http://localhost:8001"
  const response = await axios.get(`${server_url}/api/animation-options`);
  return response.data;
};

export const useAnimationOptions = () =>
  useQuery({
    queryKey: ['animation-options'],
    queryFn: getAnimationOptions,
    initialData: ANIMATION_OPTIONS_FALLBACK,
  });
