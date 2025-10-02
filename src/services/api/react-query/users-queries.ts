import {
  useGetUsersService,
  useGetUserService,
  useGetUserWithMembershipsService,
  usePostUserService,
  usePatchUserService,
  useDeleteUsersService,
  useSetActiveGroupService,
} from "../services/users";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "../../react-query/query-key-factory";
import HTTP_CODES_ENUM from "../types/http-codes";
import {
  UsersRequest,
  UserRequest,
  UserPostRequest,
  UserPatchRequest,
  UsersDeleteRequest,
  SetActiveGroupRequest,
} from "../services/users";

export const usersQueryKeys = createQueryKeys(["users"], {
  list: () => ({
    key: [],
    sub: {
      byId: (userId: string) => ({
        key: [userId],
      }),
    },
  }),
});

// Get users
export const useUsersQuery = (data: UsersRequest) => {
  const fetch = useGetUsersService();

  return useQuery({
    queryKey: usersQueryKeys.list().key,
    queryFn: async () => {
      const { status, data: responseData } = await fetch(data);
      if (status === HTTP_CODES_ENUM.OK) {
        return responseData;
      }
      throw new Error("Failed to fetch users");
    },
  });
};

// Get user by ID
export const useUserQuery = (data: UserRequest) => {
  const fetch = useGetUserService();

  return useQuery({
    queryKey: usersQueryKeys.list().sub.byId(data.id.toString()).key,
    queryFn: async () => {
      const { status, data: responseData } = await fetch(data);
      if (status === HTTP_CODES_ENUM.OK) {
        return responseData;
      }
      throw new Error("Failed to fetch user");
    },
    enabled: !!data.id,
  });
};

// Get user with memberships
export const useUserWithMembershipsQuery = (data: UserRequest) => {
  const fetch = useGetUserWithMembershipsService();

  return useQuery({
    queryKey: [
      ...usersQueryKeys.list().sub.byId(data.id.toString()).key,
      "memberships",
    ],
    queryFn: async () => {
      const { status, data: responseData } = await fetch(data);
      if (status === HTTP_CODES_ENUM.OK) {
        return responseData;
      }
      throw new Error("Failed to fetch user with memberships");
    },
    enabled: !!data.id,
  });
};

// Create user mutation
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  const fetch = usePostUserService();

  return useMutation({
    mutationFn: async (data: UserPostRequest) => {
      const { status, data: responseData } = await fetch(data);
      if (status === HTTP_CODES_ENUM.CREATED) {
        return responseData;
      }
      throw new Error("Failed to create user");
    },
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.list().key,
      });
    },
  });
};

// Update user mutation
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  const fetch = usePatchUserService();

  return useMutation({
    mutationFn: async (data: UserPatchRequest) => {
      const { status, data: responseData } = await fetch(data);
      if (status === HTTP_CODES_ENUM.OK) {
        return responseData;
      }
      throw new Error("Failed to update user");
    },
    onSuccess: (data) => {
      // Invalidate user queries
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.list().sub.byId(data.id.toString()).key,
      });
      // Invalidate users list
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.list().key,
      });
    },
  });
};

// Delete user mutation
export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  const fetch = useDeleteUsersService();

  return useMutation({
    mutationFn: async (data: UsersDeleteRequest) => {
      const { status } = await fetch(data);
      if (status === HTTP_CODES_ENUM.OK) {
        return data.id;
      }
      throw new Error("Failed to delete user");
    },
    onSuccess: (userId) => {
      // Invalidate user queries
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.list().sub.byId(userId.toString()).key,
      });
      // Invalidate users list
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.list().key,
      });
    },
  });
};

// Set active group mutation
export const useSetActiveGroupMutation = () => {
  const queryClient = useQueryClient();
  const fetch = useSetActiveGroupService();

  return useMutation({
    mutationFn: async (data: SetActiveGroupRequest) => {
      const { status, data: responseData } = await fetch(data);
      if (status === HTTP_CODES_ENUM.OK) {
        return responseData;
      }
      throw new Error("Failed to set active group");
    },
    onSuccess: (data) => {
      // Invalidate user queries
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.list().sub.byId(data.id.toString()).key,
      });
      // Invalidate user with memberships queries
      queryClient.invalidateQueries({
        queryKey: [
          ...usersQueryKeys.list().sub.byId(data.id.toString()).key,
          "memberships",
        ],
      });
      // Invalidate groups queries for this user
      queryClient.invalidateQueries({
        queryKey: ["groups", "list", "byUser", data.id.toString()],
      });
    },
  });
};
