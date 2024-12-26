import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

type UploadImageRequest = {
  articleId: string;
  file: File;
};

type UploadImageResponse = {
  message: string;
  path: string;
};

const uploadImage = async ({ articleId, file }: UploadImageRequest) => {
  const formData = new FormData();

  formData.append('articleId', articleId);
  formData.append('file', file);

  const response = await axios.post<UploadImageResponse>(
    'http://localhost:8001/api/upload-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const useUploadImage = () => {
  return useMutation<UploadImageResponse, Error, UploadImageRequest>({
    mutationFn: uploadImage,
  });
};
