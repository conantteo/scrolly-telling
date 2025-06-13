import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

type UploadFileRequest = {
  articleId: string;
  file: File;
};

type UploadFileResponse = {
  message: string;
  path: string;
};

const uploadImage = async ({ articleId, file }: UploadFileRequest) => {
  const formData = new FormData();

  formData.append('article_id', articleId);
  formData.append('file', file);

  const server_url = import.meta.env.VITE_SERVER_URL ? import.meta.env.VITE_SERVER_URL : '';

  const response = await axios.post<UploadFileResponse>(`${server_url}/api/upload-file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const useUploadImage = () => {
  return useMutation<UploadFileResponse, Error, UploadFileRequest>({
    mutationFn: uploadImage,
  });
};
