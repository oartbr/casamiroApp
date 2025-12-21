import { FileEntity } from "./file-entity";
import { Role } from "./role";
import { Membership } from "./membership";
import { Group } from "./group";

export enum UserProviderEnum {
  EMAIL = "email",
  GOOGLE = "google",
}

export type User = {
  _id: string | number;
  id: number | string;
  email: string;
  firstName?: string;
  lastName?: string;
  photo?: FileEntity;
  provider?: UserProviderEnum;
  socialId?: string;
  role?: Role;
  phoneNumber?: string;
  activeGroupId?: string;
};

export type UserWithMemberships = User & {
  memberships?: Membership[];
  primaryGroup?: Group;
  primaryRole?: string;
  totalGroups?: number;
  pendingInvitations?: number;
};
