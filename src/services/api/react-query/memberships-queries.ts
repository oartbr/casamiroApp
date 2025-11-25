import {
  useGetUserMembershipsService,
  useGetGroupMembershipsService,
  useCreateInvitationService,
  useGetInvitationByTokenService,
  useAcceptInvitationService,
  useDeclineInvitationService,
  useUpdateRoleService,
  useRemoveMemberService,
  useCancelInvitationService,
  useResendInvitationService,
} from "../services/memberships";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "../../react-query/query-key-factory";
import HTTP_CODES_ENUM from "../types/http-codes";
import {
  CreateInvitationRequest,
  AcceptInvitationRequest,
  UpdateRoleRequest,
  RemoveMemberRequest,
  CancelInvitationRequest,
  ResendInvitationRequest,
} from "../types/membership";

export const membershipsQueryKeys = createQueryKeys(["memberships"], {
  list: () => ({
    key: [],
    sub: {
      byUser: (
        userId: string,
        options?: { page?: number; limit?: number; status?: string }
      ) => ({
        key: [userId, options],
      }),
      byGroup: (
        groupId: string,
        options?: { page?: number; limit?: number; status?: string }
      ) => ({
        key: [groupId, options],
      }),
    },
  }),
  invitation: () => ({
    key: [],
    sub: {
      byToken: (token: string) => ({
        key: [token],
      }),
    },
  }),
});

// Get user memberships
export const useUserMembershipsQuery = (
  userId: string,
  options?: { page?: number; limit?: number; status?: string }
) => {
  const fetch = useGetUserMembershipsService();

  return useQuery({
    queryKey: membershipsQueryKeys.list().sub.byUser(userId, options).key,
    queryFn: async () => {
      const { status, data } = await fetch(userId, options);
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      throw new Error("Failed to fetch user memberships");
    },
    enabled: !!userId,
  });
};

// Get group memberships
export const useGroupMembershipsQuery = (
  groupId: string,
  options?: { page?: number; limit?: number; status?: string }
) => {
  const fetch = useGetGroupMembershipsService();

  return useQuery({
    queryKey: membershipsQueryKeys.list().sub.byGroup(groupId, options).key,
    queryFn: async () => {
      const { status, data } = await fetch(groupId, options);
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      throw new Error("Failed to fetch group memberships");
    },
    enabled: !!groupId,
  });
};

// Create invitation mutation
export const useCreateInvitationMutation = () => {
  const queryClient = useQueryClient();
  const fetch = useCreateInvitationService();

  return useMutation({
    mutationFn: async (data: CreateInvitationRequest) => {
      const { status, data: responseData } = await fetch(data);
      if (status === HTTP_CODES_ENUM.CREATED) {
        return responseData;
      }
      throw new Error("Failed to create invitation");
    },
    onSuccess: (data) => {
      // Invalidate group memberships queries
      queryClient.invalidateQueries({
        queryKey: membershipsQueryKeys
          .list()
          .sub.byGroup(
            typeof data.group_id === "string" ? data.group_id : data.group_id.id
          ).key,
      });
    },
  });
};

// Get invitation by token
export const useInvitationByTokenQuery = (token?: string) => {
  const fetch = useGetInvitationByTokenService();
  const invitationKey = membershipsQueryKeys.invitation();

  return useQuery({
    queryKey: token
      ? invitationKey.sub.byToken(token).key
      : [...invitationKey.key, "byToken", "missing"],
    queryFn: async () => {
      if (!token) {
        throw new Error("Invitation token is required");
      }
      const { status, data } = await fetch(token);
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      throw new Error("Failed to fetch invitation");
    },
    enabled: !!token,
    retry: false,
  });
};

// Accept invitation mutation
export const useAcceptInvitationMutation = () => {
  const queryClient = useQueryClient();
  const fetch = useAcceptInvitationService();

  return useMutation({
    mutationFn: async ({
      token,
      data,
    }: {
      token: string;
      data: AcceptInvitationRequest;
    }) => {
      const { status, data: responseData } = await fetch(token, data);
      if (status === HTTP_CODES_ENUM.OK) {
        return responseData;
      }
      throw new Error("Failed to accept invitation");
    },
    onSuccess: (data) => {
      // Invalidate user memberships queries
      queryClient.invalidateQueries({
        queryKey: membershipsQueryKeys
          .list()
          .sub.byUser(
            typeof data.user_id === "string"
              ? data.user_id
              : data.user_id.id.toString()
          ).key,
      });
      // Invalidate group memberships queries
      queryClient.invalidateQueries({
        queryKey: membershipsQueryKeys
          .list()
          .sub.byGroup(
            typeof data.group_id === "string" ? data.group_id : data.group_id.id
          ).key,
      });
    },
  });
};

// Decline invitation mutation
export const useDeclineInvitationMutation = () => {
  const queryClient = useQueryClient();
  const fetch = useDeclineInvitationService();

  return useMutation({
    mutationFn: async (token: string) => {
      const { status, data } = await fetch(token);
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      throw new Error("Failed to decline invitation");
    },
    onSuccess: (data) => {
      // Invalidate user memberships queries
      queryClient.invalidateQueries({
        queryKey: membershipsQueryKeys
          .list()
          .sub.byUser(
            typeof data.user_id === "string"
              ? data.user_id
              : data.user_id.id.toString()
          ).key,
      });
      // Invalidate group memberships queries
      queryClient.invalidateQueries({
        queryKey: membershipsQueryKeys
          .list()
          .sub.byGroup(
            typeof data.group_id === "string" ? data.group_id : data.group_id.id
          ).key,
      });
    },
  });
};

// Update role mutation
export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient();
  const fetch = useUpdateRoleService();

  return useMutation({
    mutationFn: async ({
      membershipId,
      data,
    }: {
      membershipId: string;
      data: UpdateRoleRequest;
    }) => {
      const { status, data: responseData } = await fetch(membershipId, data);
      if (status === HTTP_CODES_ENUM.OK) {
        return responseData;
      }
      throw new Error("Failed to update role");
    },
    onSuccess: (data) => {
      // Invalidate user memberships queries
      queryClient.invalidateQueries({
        queryKey: membershipsQueryKeys
          .list()
          .sub.byUser(
            typeof data.user_id === "string"
              ? data.user_id
              : data.user_id.id.toString()
          ).key,
      });
      // Invalidate group memberships queries
      queryClient.invalidateQueries({
        queryKey: membershipsQueryKeys
          .list()
          .sub.byGroup(
            typeof data.group_id === "string" ? data.group_id : data.group_id.id
          ).key,
      });
    },
  });
};

// Remove member mutation
export const useRemoveMemberMutation = () => {
  const queryClient = useQueryClient();
  const fetch = useRemoveMemberService();

  return useMutation({
    mutationFn: async ({
      membershipId,
      data,
    }: {
      membershipId: string;
      data: RemoveMemberRequest;
    }) => {
      const { status, data: responseData } = await fetch(membershipId, data);
      if (status === HTTP_CODES_ENUM.OK) {
        return responseData;
      }
      throw new Error("Failed to remove member");
    },
    onSuccess: (data) => {
      // Invalidate user memberships queries
      queryClient.invalidateQueries({
        queryKey: membershipsQueryKeys
          .list()
          .sub.byUser(
            typeof data.user_id === "string"
              ? data.user_id
              : data.user_id.id.toString()
          ).key,
      });
      // Invalidate group memberships queries
      queryClient.invalidateQueries({
        queryKey: membershipsQueryKeys
          .list()
          .sub.byGroup(
            typeof data.group_id === "string" ? data.group_id : data.group_id.id
          ).key,
      });
    },
  });
};

// Cancel invitation mutation
export const useCancelInvitationMutation = () => {
  const queryClient = useQueryClient();
  const fetch = useCancelInvitationService();

  return useMutation({
    mutationFn: async ({
      membershipId,
      data,
    }: {
      membershipId: string;
      data: CancelInvitationRequest;
    }) => {
      const { status, data: responseData } = await fetch(membershipId, data);
      if (status === HTTP_CODES_ENUM.OK) {
        return responseData;
      }
      throw new Error("Failed to cancel invitation");
    },
    onSuccess: (data) => {
      // Invalidate group memberships queries
      queryClient.invalidateQueries({
        queryKey: membershipsQueryKeys
          .list()
          .sub.byGroup(
            typeof data.group_id === "string" ? data.group_id : data.group_id.id
          ).key,
      });
    },
  });
};

// Resend invitation mutation
export const useResendInvitationMutation = () => {
  const queryClient = useQueryClient();
  const fetch = useResendInvitationService();

  return useMutation({
    mutationFn: async ({
      membershipId,
      data,
    }: {
      membershipId: string;
      data: ResendInvitationRequest;
    }) => {
      const { status, data: responseData } = await fetch(membershipId, data);
      if (status === HTTP_CODES_ENUM.OK) {
        return responseData;
      }
      throw new Error("Failed to resend invitation");
    },
    onSuccess: (data) => {
      // Invalidate group memberships queries
      queryClient.invalidateQueries({
        queryKey: membershipsQueryKeys
          .list()
          .sub.byGroup(
            typeof data.group_id === "string" ? data.group_id : data.group_id.id
          ).key,
      });
    },
  });
};
