import _ from 'lodash';
import { PostWebsiteRequest } from '../hooks/useGenerateWebsite';

const SESSION_STORAGE_KEY = 'last-scrolly-article';

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
