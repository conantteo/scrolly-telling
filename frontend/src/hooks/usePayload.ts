import axios from 'axios';

const server_url = import.meta.env.VITE_SERVER_URL ? import.meta.env.VITE_SERVER_URL : '';

export const uploadPayload = async (payload: string, articleId: string | undefined) => {
  await axios.post<Blob>(
    `${server_url}/api/payload`,
    { payload, article_id: articleId },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

export const getPayload = async (article_id: string) => {
  const response = await axios.get<string>(`${server_url}/api/payload/${article_id}`);
  return response.data ?? null;
};
