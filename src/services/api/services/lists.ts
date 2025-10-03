import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import {
  List,
  ListItem,
  CreateListRequest,
  UpdateListRequest,
  CreateListItemRequest,
  UpdateListItemRequest,
  ListsResponse,
  ListItemsResponse,
} from "../types/list";
import { RequestConfigType } from "./types/request-config";

// Get all lists
export function useGetListsService() {
  const fetch = useFetch();

  return useCallback(
    (requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/lists`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ListsResponse>);
    },
    [fetch]
  );
}

// Get list by ID
export function useGetListService() {
  const fetch = useFetch();

  return useCallback(
    (listId: string, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/lists/${listId}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<List>);
    },
    [fetch]
  );
}

// Get lists by group
export function useGetListsByGroupService() {
  const fetch = useFetch();

  return useCallback(
    (groupId: string, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/lists/groups/${groupId}/lists`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ListsResponse>);
    },
    [fetch]
  );
}

// Get default list by group
export function useGetDefaultListByGroupService() {
  const fetch = useFetch();

  return useCallback(
    (groupId: string, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/lists/groups/${groupId}/lists/default`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<List>);
    },
    [fetch]
  );
}

// Create new list
export function useCreateListService() {
  const fetch = useFetch();

  return useCallback(
    (data: CreateListRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/lists`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<List>);
    },
    [fetch]
  );
}

// Update list
export function useUpdateListService() {
  const fetch = useFetch();

  return useCallback(
    (
      listId: string,
      data: UpdateListRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetch(`${API_URL}/v1/lists/${listId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<List>);
    },
    [fetch]
  );
}

// Delete list
export function useDeleteListService() {
  const fetch = useFetch();

  return useCallback(
    (listId: string, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/lists/${listId}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<undefined>);
    },
    [fetch]
  );
}

// Get list items
export function useGetListItemsService() {
  const fetch = useFetch();

  return useCallback(
    (listId: string, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/lists/${listId}/items`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<ListItemsResponse>);
    },
    [fetch]
  );
}

// Create new list item
export function useCreateListItemService() {
  const fetch = useFetch();

  return useCallback(
    (data: CreateListItemRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/lists/items`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<List>);
    },
    [fetch]
  );
}

// Update list item
export function useUpdateListItemService() {
  const fetch = useFetch();

  return useCallback(
    (
      itemId: string,
      data: UpdateListItemRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetch(`${API_URL}/v1/lists/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<List>);
    },
    [fetch]
  );
}

// Delete list item
export function useDeleteListItemService() {
  const fetch = useFetch();

  return useCallback(
    (itemId: string, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/lists/items/${itemId}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<undefined>);
    },
    [fetch]
  );
}


