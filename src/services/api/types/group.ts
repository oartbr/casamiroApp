export type Group = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string; // ID of the group owner/admin
  createdBy: string; // ID of the group creator;
  isPersonal: boolean;
  iconUrl: string;
  members?: Array<{
    _id: string;
    user_id: string;
    role: string;
    status: string;
    user?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    invited_by?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  settings?: {
    allowInvitations: boolean;
    requireApproval: boolean;
    maxMembers?: number;
  };
};

export type CreateGroupRequest = {
  name: string;
  description?: string;
  settings?: {
    allowInvitations: boolean;
    requireApproval: boolean;
    maxMembers?: number;
  };
};

export type UpdateGroupRequest = {
  name?: string;
  description?: string;
  settings?: {
    allowInvitations?: boolean;
    requireApproval?: boolean;
    maxMembers?: number;
  };
};

export type UserGroupsResponse = {
  groupsByStatus: {
    active: Array<{
      _id: string;
      group_id: Group;
      role: string;
      status: string;
    }>;
    pending: Array<{
      _id: string;
      group_id: Group;
      role: string;
      status: string;
      token?: string;
    }>;
  };
};
