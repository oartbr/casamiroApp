import {
  useGetUserGroupsService,
  useGetGroupService,
  useCreateGroupService,
  useUpdateGroupService,
  useDeleteGroupService,
} from "../services/groups";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "../../react-query/query-key-factory";
import HTTP_CODES_ENUM from "../types/http-codes";
import { CreateGroupRequest, UpdateGroupRequest } from "../types/group";

export const groupsQueryKeys = createQueryKeys(["groups"], {
  list: () => ({
    key: [],
    sub: {
      byUser: (userId: string) => ({
        key: [userId],
      }),
      byId: (groupId: string) => ({
        key: [groupId],
      }),
    },
  }),
});

// Get user groups
export const useUserGroupsQuery = (userId: string) => {
  const fetch = useGetUserGroupsService();

  return useQuery({
    queryKey: groupsQueryKeys.list().sub.byUser(userId).key,
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const { status, data } = await fetch(userId);
      if (status === HTTP_CODES_ENUM.OK) {
        // Filter out orphaned memberships (where group_id is null or invalid)
        // This prevents "Cannot read properties of null" errors across all pages
        return {
          ...data,
          groupsByStatus: {
            active: (data.groupsByStatus?.active || []).filter(
              (membership) =>
                membership?.group_id &&
                typeof membership.group_id === "object" &&
                membership.group_id.id
            ),
            pending: (data.groupsByStatus?.pending || []).filter(
              (membership) =>
                membership?.group_id &&
                typeof membership.group_id === "object" &&
                membership.group_id.id
            ),
          },
        };
      }
      throw new Error("Failed to fetch user groups");
    },
    enabled: !!userId && userId.trim() !== "",
  });
};

// Get group by ID
export const useGroupQuery = (groupId: string) => {
  const fetch = useGetGroupService();

  return useQuery({
    queryKey: groupsQueryKeys.list().sub.byId(groupId).key,
    queryFn: async () => {
      const { status, data } = await fetch(groupId);
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      throw new Error("Failed to fetch group");
    },
    enabled: !!groupId,
  });
};

// Create group mutation
export const useCreateGroupMutation = () => {
  const queryClient = useQueryClient();
  const fetch = useCreateGroupService();

  return useMutation({
    mutationFn: async (data: CreateGroupRequest) => {
      const { status, data: responseData } = await fetch(data);
      if (status === HTTP_CODES_ENUM.CREATED) {
        return responseData;
      }
      throw new Error("Failed to create group");
    },
    onSuccess: (data) => {
      // Invalidate user groups queries
      queryClient.invalidateQueries({
        queryKey: groupsQueryKeys.list().sub.byUser(data.createdBy).key,
      });
    },
  });
};

// Update group mutation
export const useUpdateGroupMutation = () => {
  const queryClient = useQueryClient();
  const fetch = useUpdateGroupService();

  return useMutation({
    mutationFn: async ({
      groupId,
      data,
    }: {
      groupId: string;
      data: UpdateGroupRequest;
    }) => {
      const { status, data: responseData } = await fetch(groupId, data);
      if (status === HTTP_CODES_ENUM.OK) {
        return responseData;
      }
      throw new Error("Failed to update group");
    },
    onSuccess: (data) => {
      // Invalidate group queries
      queryClient.invalidateQueries({
        queryKey: groupsQueryKeys.list().sub.byId(data.id).key,
      });
      // Invalidate user groups queries
      queryClient.invalidateQueries({
        queryKey: groupsQueryKeys.list().sub.byUser(data.createdBy).key,
      });
    },
  });
};

// Delete group mutation
export const useDeleteGroupMutation = () => {
  const queryClient = useQueryClient();
  const fetch = useDeleteGroupService();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const { status } = await fetch(groupId);
      if (
        status === HTTP_CODES_ENUM.OK ||
        status === HTTP_CODES_ENUM.NO_CONTENT
      ) {
        return groupId;
      }
      throw new Error("Failed to delete group");
    },
    onSuccess: (groupId) => {
      // Invalidate group queries
      queryClient.invalidateQueries({
        queryKey: groupsQueryKeys.list().sub.byId(groupId).key,
      });
      // Invalidate all user groups queries
      queryClient.invalidateQueries({
        queryKey: groupsQueryKeys.list().key,
      });
    },
  });
};
