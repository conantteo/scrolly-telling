import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const ANIMATION_OPTIONS_FALLBACK = ['overlap', 'fade'];

const getAnimationOptions = async () => {
  const response = await axios.get('http://localhost:8001/api/animation-options');
  return response.data;
};

export const useAnimationOptions = () =>
  useQuery({
    queryKey: ['animation-options'],
    queryFn: getAnimationOptions,
    initialData: ANIMATION_OPTIONS_FALLBACK,
  });
