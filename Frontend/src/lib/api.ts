// api.ts

import axiosClient from "./axios";

type Params = Record<string, any>;

const get = <T>(url: string, params?: Params): Promise<T> => {
  return axiosClient.get<T>(url, { params }) as Promise<T>;
};

const post = <T>(url: string, data?: any, params?: Params): Promise<T> => {
  return axiosClient.post<T>(url, data, { params }) as Promise<T>;
};

const put = <T>(url: string, data?: any): Promise<T> => {
  return axiosClient.put<T>(url, data) as Promise<T>;
};

const patch = <T>(url: string, data?: any): Promise<T> => {
  return axiosClient.patch<T>(url, data) as Promise<T>;
};

const del = <T>(url: string, params?: Params): Promise<T> => {
  return axiosClient.delete<T>(url, { params }) as Promise<T>;
};

export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
};
