export interface MenuItemConfig {
  label: string;
  href: string | null;
  roles: string[];
  mobile: boolean;
  desktop: boolean;
  enabled?: string;
  userMenu?: boolean;
  action?: string;
  type?: string;
  icon?: string; // Material Icons name (e.g., "Home", "List", "Groups")
}

export const menuConfig: MenuItemConfig[] = [
  {
    label: "common:navigation.home",
    href: "/",
    roles: [],
    mobile: true,
    desktop: true,
    type: "page",
    icon: "Home",
  },
  {
    label: "common:navigation.listing",
    href: "/listing",
    roles: ["USER"],
    mobile: true,
    desktop: true,
    type: "page",
    icon: "List",
  },
  {
    label: "common:navigation.lists",
    href: "/lists",
    roles: ["USER"],
    mobile: true,
    desktop: true,
    type: "page",
    icon: "Lists",
  },
  {
    label: "common:navigation.scan",
    href: "/scan",
    roles: ["USER"],
    mobile: true,
    desktop: true,
    type: "page",
    icon: "Scan",
  },
  {
    label: "common:navigation.users",
    href: "/admin-panel/users",
    roles: ["SUPER", "ADMIN"],
    mobile: true,
    desktop: true,
    type: "page",
    icon: "Users",
  },
  {
    label: "common:navigation.signIn",
    href: "/check-phone-number",
    roles: ["GUEST"],
    mobile: true,
    desktop: true,
    type: "auth",
    icon: "Login",
  },
  {
    label: "common:navigation.profile",
    href: "/profile",
    roles: [],
    mobile: false,
    desktop: true,
    userMenu: true,
    type: "profile",
    icon: "Profile",
  },
  {
    label: "common:navigation.groups",
    href: "/groups",
    roles: ["USER"],
    mobile: false,
    desktop: true,
    userMenu: true,
    type: "page",
    icon: "Groups",
  },
  {
    label: "common:navigation.referrals",
    href: "/referrals",
    roles: ["USER"],
    mobile: false,
    desktop: true,
    userMenu: true,
    type: "page",
    icon: "Referrals",
  },
  {
    label: "common:navigation.logout",
    href: null,
    roles: [],
    mobile: false,
    desktop: true,
    userMenu: true,
    action: "logOut",
    type: "auth",
    icon: "Logout",
  },
];
