export enum RoleEnum {
  ADMIN = 1,
  USER = 2,
  GUEST = 3,
}

export type Role = {
  id: number | string;
  name?: string;
};
