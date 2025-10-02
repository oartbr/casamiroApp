import { Membership } from "./membership";

export type Group = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string; // ID of the group owner/admin
  createdBy: string | { _id: string; firstName: string; lastName: string }; // ID of the group creator or populated user object;
  isPersonal: boolean;
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

export type GroupsResponse = {
  groupsByStatus: {
    active: Membership[];
    pending: Membership[];
    declined: Membership[];
    removed: Membership[];
  };
  roleDistribution: Record<string, number>;
  totalActiveGroups: number;
  totalPendingInvitations: number;
  summary: {
    totalGroups: number;
    activeGroups: number;
    pendingInvitations: number;
    primaryRole: string;
    primaryGroup: {
      _id: string;
      name: string;
    };
  };
};
