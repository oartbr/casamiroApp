import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useGetListsService,
  useGetListService,
  useGetListsByGroupService,
  useGetDefaultListByGroupService,
  useCreateListService,
  useUpdateListService,
  useDeleteListService,
  useGetListItemsService,
  useCreateListItemService,
  useUpdateListItemService,
  useDeleteListItemService,
} from "../services/lists";
import { createQueryKeys } from "../../react-query/query-key-factory";
import { List, ListItem, CreateListRequest, UpdateListRequest, CreateListItemRequest, UpdateListItemRequest } from "../types/list";
import HTTP_CODES_ENUM from "../types/http-codes";

// Query Keys
export const listQueryKeys = createQueryKeys(["lists"], {
  list: () => ({
    key: [],
    sub: {
      byId: (listId: string) => ({
        key: [listId],
      }),
      byGroup: (groupId: string) => ({
        key: ["group", groupId],
      }),
      default: (groupId: string) => ({
        key: ["group", groupId, "default"],
      }),
    },
  }),
  items: () => ({
    key: ["items"],
    sub: {
      byList: (listId: string) => ({
        key: [listId],
      }),
    },
  }),
});

// Get all lists
export function useGetListsQuery() {
  const getListsService = useGetListsService();

  return useQuery({
    queryKey: listQueryKeys.all().key,
    queryFn: async () => {
      const { status, data } = await getListsService();
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      throw new Error("Failed to fetch lists");
    },
  });
}

// Get list by ID
export function useGetListQuery(listId: string, enabled: boolean = true) {
  const getListService = useGetListService();

  return useQuery({
    queryKey: listQueryKeys.list().sub.byId(listId).key,
    queryFn: async () => {
      const { status, data } = await getListService(listId);
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      throw new Error("Failed to fetch list");
    },
    enabled: enabled && !!listId,
  });
}

// Get lists by group
export function useGetListsByGroupQuery(groupId: string, enabled: boolean = true) {
  const getListsByGroupService = useGetListsByGroupService();

  return useQuery({
    queryKey: listQueryKeys.list().sub.byGroup(groupId).key,
    queryFn: async () => {
      const { status, data } = await getListsByGroupService(groupId);
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      throw new Error("Failed to fetch lists by group");
    },
    enabled: enabled && !!groupId,
  });
}

// Get default list by group
export function useGetDefaultListByGroupQuery(groupId: string, enabled: boolean = true) {
  const getDefaultListByGroupService = useGetDefaultListByGroupService();

  return useQuery({
    queryKey: listQueryKeys.list().sub.default(groupId).key,
    queryFn: async () => {
      const { status, data } = await getDefaultListByGroupService(groupId);
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      throw new Error("Failed to fetch default list");
    },
    enabled: enabled && !!groupId,
  });
}

// Get list items
export function useGetListItemsQuery(listId: string, enabled: boolean = true) {
  const getListItemsService = useGetListItemsService();

  return useQuery({
    queryKey: listQueryKeys.items().sub.byList(listId).key,
    queryFn: async () => {
      const { status, data } = await getListItemsService(listId);
      if (status === HTTP_CODES_ENUM.OK) {
        return data;
      }
      throw new Error("Failed to fetch list items");
    },
    enabled: enabled && !!listId,
  });
}

// Create list mutation
export function useCreateListMutation() {
  const queryClient = useQueryClient();
  const createListService = useCreateListService();

  return useMutation({
    mutationFn: async (data: CreateListRequest) => {
      const { status, data: responseData } = await createListService(data);
      if (status === HTTP_CODES_ENUM.CREATED) {
        return responseData;
      }
      throw new Error("Failed to create list");
    },
    onSuccess: (newList) => {
      // Invalidate and refetch lists queries
      queryClient.invalidateQueries({ queryKey: listQueryKeys.all().key });
      queryClient.invalidateQueries({ queryKey: listQueryKeys.list().sub.byGroup(newList.groupId).key });
      
      // Add the new list to the cache
      queryClient.setQueryData(listQueryKeys.list().sub.byId(newList.id).key, newList);
    },
  });
}

// Update list mutation
export function useUpdateListMutation() {
  const queryClient = useQueryClient();
  const updateListService = useUpdateListService();

  return useMutation({
    mutationFn: async ({ listId, data }: { listId: string; data: UpdateListRequest }) => {
      const { status, data: responseData } = await updateListService(listId, data);
      if (status === HTTP_CODES_ENUM.OK) {
        return responseData;
      }
      throw new Error("Failed to update list");
    },
    onSuccess: (updatedList) => {
      // Update the list in cache
      queryClient.setQueryData(listQueryKeys.list().sub.byId(updatedList.id).key, updatedList);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: listQueryKeys.all().key });
      queryClient.invalidateQueries({ queryKey: listQueryKeys.list().sub.byGroup(updatedList.groupId).key });
    },
  });
}

// Delete list mutation
export function useDeleteListMutation() {
  const queryClient = useQueryClient();
  const deleteListService = useDeleteListService();

  return useMutation({
    mutationFn: async (listId: string) => {
      const { status } = await deleteListService(listId);
      if (status === HTTP_CODES_ENUM.NO_CONTENT) {
        return listId;
      }
      throw new Error("Failed to delete list");
    },
    onSuccess: (listId) => {
      // Remove the list from cache
      queryClient.removeQueries({ queryKey: listQueryKeys.list().sub.byId(listId).key });
      
      // Invalidate lists queries
      queryClient.invalidateQueries({ queryKey: listQueryKeys.all().key });
    },
  });
}

// Create list item mutation
export function useCreateListItemMutation() {
  const queryClient = useQueryClient();
  const createListItemService = useCreateListItemService();

  return useMutation({
    mutationFn: async (data: CreateListItemRequest) => {
      const { status, data: responseData } = await createListItemService(data);
      if (status === HTTP_CODES_ENUM.CREATED) {
        return responseData;
      }
      throw new Error("Failed to create list item");
    },
    onSuccess: (updatedList) => {
      // Invalidate list queries since items are now embedded
      queryClient.invalidateQueries({ queryKey: listQueryKeys.list().sub.byId(updatedList.id).key });
      queryClient.invalidateQueries({ queryKey: listQueryKeys.list().sub.byGroup(updatedList.groupId).key });
    },
  });
}

// Update list item mutation
export function useUpdateListItemMutation() {
  const queryClient = useQueryClient();
  const updateListItemService = useUpdateListItemService();

  return useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: UpdateListItemRequest }) => {
      const { status, data: responseData } = await updateListItemService(itemId, data);
      if (status === HTTP_CODES_ENUM.OK) {
        return responseData;
      }
      throw new Error("Failed to update list item");
    },
    onSuccess: (updatedList) => {
      // Invalidate list queries since items are now embedded
      queryClient.invalidateQueries({ queryKey: listQueryKeys.list().sub.byId(updatedList.id).key });
      queryClient.invalidateQueries({ queryKey: listQueryKeys.list().sub.byGroup(updatedList.groupId).key });
    },
  });
}

// Delete list item mutation
export function useDeleteListItemMutation() {
  const queryClient = useQueryClient();
  const deleteListItemService = useDeleteListItemService();

  return useMutation({
    mutationFn: async ({ itemId, listId }: { itemId: string; listId: string }) => {
      const { status } = await deleteListItemService(itemId);
      if (status === HTTP_CODES_ENUM.NO_CONTENT) {
        return { itemId, listId };
      }
      throw new Error("Failed to delete list item");
    },
    onSuccess: (_, { listId }) => {
      // Invalidate list queries since items are now embedded
      queryClient.invalidateQueries({ queryKey: listQueryKeys.list().sub.byId(listId).key });
      // Note: We can't invalidate by group since we don't have groupId in the delete mutation
      // The frontend will need to refetch the list manually
    },
  });
}
