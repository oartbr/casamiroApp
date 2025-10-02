import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import {
  Membership,
  CreateInvitationRequest,
  AcceptInvitationRequest,
  UpdateRoleRequest,
  RemoveMemberRequest,
  CancelInvitationRequest,
  ResendInvitationRequest,
  MembershipsListResponse,
} from "../types/membership";
import { RequestConfigType } from "./types/request-config";

// Get user memberships
export function useGetUserMembershipsService() {
  const fetch = useFetch();

  return useCallback(
    (
      userId: string,
      options?: { page?: number; limit?: number; status?: string },
      requestConfig?: RequestConfigType
    ) => {
      const url = new URL(`${API_URL}/v1/users/${userId}/memberships`);
      if (options?.page)
        url.searchParams.append("page", options.page.toString());
      if (options?.limit)
        url.searchParams.append("limit", options.limit.toString());
      if (options?.status) url.searchParams.append("status", options.status);

      return fetch(url.toString(), {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<MembershipsListResponse>);
    },
    [fetch]
  );
}

// Get group memberships
export function useGetGroupMembershipsService() {
  const fetch = useFetch();

  return useCallback(
    (
      groupId: string,
      options?: { page?: number; limit?: number; status?: string },
      requestConfig?: RequestConfigType
    ) => {
      const url = new URL(`${API_URL}/v1/memberships/group/${groupId}`);
      if (options?.page)
        url.searchParams.append("page", options.page.toString());
      if (options?.limit)
        url.searchParams.append("limit", options.limit.toString());
      if (options?.status) url.searchParams.append("status", options.status);

      return fetch(url.toString(), {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<MembershipsListResponse>);
    },
    [fetch]
  );
}

// Create invitation
export function useCreateInvitationService() {
  const fetch = useFetch();

  return useCallback(
    (data: CreateInvitationRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/memberships/invite`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Membership>);
    },
    [fetch]
  );
}

// Accept invitation
export function useAcceptInvitationService() {
  const fetch = useFetch();

  return useCallback(
    (
      token: string,
      data: AcceptInvitationRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetch(`${API_URL}/v1/memberships/accept/${token}`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Membership>);
    },
    [fetch]
  );
}

// Decline invitation
export function useDeclineInvitationService() {
  const fetch = useFetch();

  return useCallback(
    (token: string, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/memberships/decline/${token}`, {
        method: "POST",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Membership>);
    },
    [fetch]
  );
}

// Update role
export function useUpdateRoleService() {
  const fetch = useFetch();

  return useCallback(
    (
      membershipId: string,
      data: UpdateRoleRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetch(`${API_URL}/v1/memberships/${membershipId}/role`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Membership>);
    },
    [fetch]
  );
}

// Remove member
export function useRemoveMemberService() {
  const fetch = useFetch();

  return useCallback(
    (
      membershipId: string,
      data: RemoveMemberRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetch(`${API_URL}/v1/memberships/${membershipId}`, {
        method: "DELETE",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Membership>);
    },
    [fetch]
  );
}

// Cancel invitation
export function useCancelInvitationService() {
  const fetch = useFetch();

  return useCallback(
    (
      membershipId: string,
      data: CancelInvitationRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetch(`${API_URL}/v1/memberships/invite/${membershipId}`, {
        method: "DELETE",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Membership>);
    },
    [fetch]
  );
}

// Resend invitation
export function useResendInvitationService() {
  const fetch = useFetch();

  return useCallback(
    (
      membershipId: string,
      data: ResendInvitationRequest,
      requestConfig?: RequestConfigType
    ) => {
      return fetch(`${API_URL}/v1/memberships/invite/${membershipId}/resend`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Membership>);
    },
    [fetch]
  );
}
