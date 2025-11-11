import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import ListIcon from "@mui/icons-material/List";
import GroupIcon from "@mui/icons-material/Group";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PeopleIcon from "@mui/icons-material/People";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import Image from "next/image";
import Link from "@/components/link";
import { menuConfig, MenuItemConfig } from "../menu.config";
import ThemeSwitchButton from "@/components/switch-theme-button";
import InstallButton from "@/components/pwa/installButton";
import { User } from "@/services/api/types/user";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import { useGroupQuery } from "@/services/api/react-query/groups-queries";
// import Chip from "@mui/material/Chip";

interface MenuBuilderProps {
  user: User | null; // Replace with your user type
  isLoaded: boolean;
  logOut: () => void;
  logos: { long: string; short: string };
  pwa?: boolean | false;
  // handle?: (event: React.MouseEvent<HTMLElement>) => void;
}

const MenuBuilder: React.FC<MenuBuilderProps> = ({
  user = {} as User,
  isLoaded,
  logOut,
  logos,
  pwa,
  // handle,
}) => {
  const { t } = useTranslation();
  let isAuthMenu = false;
  const [anchorElementNav, setAnchorElementNav] = useState<null | HTMLElement>(
    null
  );
  const [anchorElementUser, setAnchorElementUser] =
    useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElementNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElementUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElementNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElementUser(null);
  };

  const getUserRole = () => {
    return user && user.role ? user.role.name : "GUEST";
  };
  console.log({ user });

  // Fetch active group data
  const activeGroupId = user?.activeGroupId;
  const { data: activeGroup, isLoading: isLoadingGroup } = useGroupQuery(
    activeGroupId || ""
  );
  // Helper function to get icon component based on icon name
  const getIcon = (iconName?: string, withMargin: boolean = false) => {
    if (!iconName) return null;
    const iconMap: { [key: string]: React.ReactElement } = {
      Home: <HomeIcon />,
      List: <ListIcon />,
      Groups: <GroupIcon />,
      Lists: <PlaylistAddCheckIcon />,
      Scan: <QrCodeScannerIcon />,
      Users: <PeopleIcon />,
      Login: <LoginIcon />,
      Profile: <PersonIcon />,
      Logout: <LogoutIcon />,
    };
    const icon = iconMap[iconName];
    if (!icon) return null;
    return withMargin ? (
      <Box sx={{ mr: 1, display: "flex" }}>{icon}</Box>
    ) : (
      icon
    );
  };

  const renderMenuItem = (item: MenuItemConfig, index: number) => {
    const userRole = getUserRole() || "GUEST";
    const isVisible = item.roles.length === 0 || item.roles.includes(userRole);
    const isEnabled = true; // item.enabled ? eval(item.enabled) : true; // Be cautious with eval; consider safer alternatives

    if (!isVisible || !isEnabled) return null;
    isAuthMenu =
      item.mobile === true &&
      item.roles[0] === "GUEST" &&
      item.type === "auth" &&
      isAuthMenu === false;

    const handleClick = () => {
      if (item.action === "logOut") {
        logOut();
      }
      handleCloseNavMenu();
      handleCloseUserMenu();
    };

    return (
      <Grid key={index}>
        {isAuthMenu ? <Divider key="divider" /> : null}
        <MenuItem
          onClick={handleClick}
          component={item.href ? Link : "div"}
          href={item.href || undefined}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {getIcon(item.icon, true)}
            <Typography textAlign="center">{t(item.label)}</Typography>
          </Box>
        </MenuItem>
      </Grid>
    );
  };

  const renderButton = (item: MenuItemConfig, index: number) => {
    const userRole = getUserRole() || "GUEST";
    const isVisible = item.roles.length === 0 || item.roles.includes(userRole);
    const isEnabled = true; // item.enabled ? eval(item.enabled) : true;

    if (!isVisible || !isEnabled) return null;

    return (
      <Button
        key={index}
        onClick={handleCloseNavMenu}
        sx={{ my: 2, color: "white", display: "flex", alignItems: "center" }}
        component={Link}
        href={item.href!}
      >
        {t(item.label)}
      </Button>
    );
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <div className="PWA_installButton">{pwa && <InstallButton />}</div>
        <Toolbar disableGutters>
          <Image
            className="logoHeader"
            src={logos.long}
            alt="logo"
            fill={true}
            priority
          />
          <Image
            className="logoHeaderShort"
            src={logos.short}
            alt="logo"
            fill={true}
            priority
          />
          {/* Active Group Display */}
          {user && activeGroupId && (
            <>
              {isLoadingGroup ? (
                <CircularProgress size={20} color="inherit" />
              ) : activeGroup?.iconUrl ? (
                <Image
                  className="groupIconHeader"
                  src={activeGroup.iconUrl}
                  alt={activeGroup.name}
                  fill={true}
                  priority
                  title={activeGroup.name}
                />
              ) : null}
            </>
          )}
          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElementNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElementNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {menuConfig
                .filter((item) => item.mobile && !item.userMenu)
                .map((item, index) => renderMenuItem(item, index))}
            </Menu>
          </Box>

          {/* App Name */}
          <Typography
            className="appName"
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {/* t("common:app-name") */}
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {menuConfig
              .filter(
                (item) => item.desktop && !item.userMenu && item.type !== "auth"
              )
              .map((item, index) => renderButton(item, index))}
          </Box>

          {/* User Menu / Auth Buttons */}
          {!isLoaded ? (
            <CircularProgress color="inherit" />
          ) : user ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title={t("common:navigation.profile")}>
                <IconButton
                  onClick={handleOpenUserMenu}
                  sx={{ p: 0 }}
                  data-testid="profile-menu-item"
                >
                  <Avatar
                    alt={user?.firstName + " " + user?.lastName}
                    src={user.photo?.toString()}
                  />
                </IconButton>
              </Tooltip>
              <ThemeSwitchButton />
              <Menu
                sx={{ mt: 5.5 }}
                id="menu-appbar"
                anchorEl={anchorElementUser}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorElementUser)}
                onClose={handleCloseUserMenu}
              >
                {menuConfig
                  .filter((item) => item.userMenu)
                  .map((item, index) => renderMenuItem(item, index))}
              </Menu>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
              <ThemeSwitchButton />
              {menuConfig
                .filter((item) => item.desktop && item.roles.includes("GUEST"))
                .map((item, index) => renderButton(item, index))}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default MenuBuilder;
