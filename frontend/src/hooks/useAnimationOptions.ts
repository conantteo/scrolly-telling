import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const ANIMATION_OPTIONS_RESPONSE_FALLBACK = {
  ['animation-options']: ['overlap', 'fade'],
};

const getAnimationOptions = async () => {
  const server_url = import.meta.env.VITE_SERVER_URL ? import.meta.env.VITE_SERVER_URL : '';
  const response = await axios.get(`${server_url}/api/animation-options`);
  return response.data ?? ANIMATION_OPTIONS_RESPONSE_FALLBACK;
};

export const useAnimationOptions = () =>
  useQuery({
    queryKey: ['animation-options'],
    queryFn: getAnimationOptions,
    initialData: ANIMATION_OPTIONS_RESPONSE_FALLBACK,
  });
