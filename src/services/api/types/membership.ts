import { Group } from "./group";
import { User } from "./user";

export type Membership = {
  _id: string;
  user_id: string | User;
  group_id: string | Group;
  invitee_phone?: string;
  invited_by: string | User;
  status: "pending" | "active" | "declined" | "removed";
  role: "admin" | "editor" | "contributor";
  token?: string;
  expiration_date?: Date;
  accepted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type MembershipWithDetails = Membership & {
  group: Group;
  user?: User;
  invitedByUser?: User;
};

export type CreateInvitationRequest = {
  group_id: string;
  invitee_phone?: string;
  invited_by: string;
  role?: "admin" | "editor" | "contributor";
};

export type AcceptInvitationRequest = {
  userId: string;
};

export type UpdateRoleRequest = {
  newRole: "admin" | "editor" | "contributor";
  updaterId: string;
};

export type RemoveMemberRequest = {
  removerId: string;
};

export type CancelInvitationRequest = {
  cancellerId: string;
};

export type ResendInvitationRequest = {
  resenderId: string;
};

export type MembershipsListResponse = {
  results: MembershipWithDetails[];
  hasNextPage: boolean;
  totalCount: number;
};
