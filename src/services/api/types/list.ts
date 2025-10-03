export type List = {
  id: string;
  name: string;
  description?: string;
  groupId: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: {
    allowItemDeletion: boolean;
    requireApprovalForItems: boolean;
  };
  items: ListItem[];
  group?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

export type ListItem = {
  id: string;
  text: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  order: number;
  createdAt: Date;
  updatedAt: Date;
  addedBy: string;
};

export type CreateListRequest = {
  name: string;
  description?: string;
  groupId: string;
  isDefault?: boolean;
  settings?: {
    allowItemDeletion?: boolean;
    requireApprovalForItems?: boolean;
  };
};

export type UpdateListRequest = {
  name?: string;
  description?: string;
  isDefault?: boolean;
  settings?: {
    allowItemDeletion?: boolean;
    requireApprovalForItems?: boolean;
  };
};

export type CreateListItemRequest = {
  text: string;
  listId: string;
  isCompleted?: boolean;
  order?: number;
};

export type UpdateListItemRequest = {
  text?: string;
  isCompleted?: boolean;
  order?: number;
};

export type ListsResponse = {
  results: List[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
};

export type ListItemsResponse = {
  results: ListItem[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
};


