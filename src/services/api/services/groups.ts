import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { Group, CreateGroupRequest, UpdateGroupRequest } from "../types/group";
import { RequestConfigType } from "./types/request-config";

// Get all groups for a user
export function useGetUserGroupsService() {
  const fetch = useFetch();

  return useCallback(
    (userId: string, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/users/${userId}/groups`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GroupsResponse>);
    },
    [fetch]
  );
}

// Get group by ID
export function useGetGroupService() {
  const fetch = useFetch();

  return useCallback(
    (groupId: string, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/groups/${groupId}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Group>);
    },
    [fetch]
  );
}

// Create new group
export function useCreateGroupService() {
  const fetch = useFetch();

  return useCallback(
    (data: CreateGroupRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/groups`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Group>);
    },
    [fetch]
  );
}

// Update group
export function useUpdateGroupService() {
  const fetch = useFetch();

  return useCallback(
    (
      groupId: string,
      data: UpdateGroupRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetch(`${API_URL}/v1/groups/${groupId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Group>);
    },
    [fetch]
  );
}

// Delete group
export function useDeleteGroupService() {
  const fetch = useFetch();

  return useCallback(
    (groupId: string, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/groups/${groupId}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<undefined>);
    },
    [fetch]
  );
}
