import _ from 'lodash';
import { PostWebsiteRequest } from '../hooks/useGenerateWebsite';

const SESSION_STORAGE_KEY = 'last-scrolly-article';

export const getArticleFromSessionStorage = (): Partial<PostWebsiteRequest> | null => {
  const value = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  const sessionResult = value ? JSON.parse(value) : null;
  return sessionResult;
};

export const setArticleFromSessionStorage = (data: Partial<PostWebsiteRequest>) => {
  if (data) {
    const value = getArticleFromSessionStorage();
    if (value) {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ ..._.cloneDeep(value), ..._.cloneDeep(data) })
      );
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ ..._.cloneDeep(data) }));
    }
  }
};
