import _ from 'lodash';
import { PostWebsiteRequest } from '../hooks/useGenerateWebsite';
import { getPayload, uploadPayload } from '../hooks/usePayload';

const SESSION_STORAGE_KEY = 'last-scrolly-article';

export const getArticleFromRemoteStorage = async (article_id: string) => {
  const data = await getPayload(article_id);
  window.localStorage.setItem(SESSION_STORAGE_KEY, data);
  window.location.reload();
};

export const uploadArticalIntoRemoteStorage = (payload: Partial<PostWebsiteRequest>) => {
  const value = getArticleFromLocalStorage();
  uploadPayload(
    JSON.stringify({ ..._.cloneDeep(value), ..._.cloneDeep(payload) }),
    value?.articleId
  );
};

export const getArticleFromLocalStorage = (): Partial<PostWebsiteRequest> | null => {
  const value = window.localStorage.getItem(SESSION_STORAGE_KEY);
  const sessionResult = value ? JSON.parse(value) : null;
  return sessionResult;
};

export const setArticleFromLocalStorage = (data: Partial<PostWebsiteRequest>) => {
  if (data) {
    const value = getArticleFromLocalStorage();
    if (value) {
      window.localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ ..._.cloneDeep(value), ..._.cloneDeep(data) })
      );
    } else {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ ..._.cloneDeep(data) }));
    }
  }
};

export const deleteArticleFromLocalStorage = () => {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
};
