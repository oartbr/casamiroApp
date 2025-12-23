"use client";

import { useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import {
  useUserGroupsQuery,
  useCreateGroupMutation,
  useDeleteGroupMutation,
} from "@/services/api/react-query/groups-queries";
import {
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useGroupMembershipsQuery,
} from "@/services/api/react-query/memberships-queries";
import { useGetGroupMembershipsService } from "@/services/api/services/memberships";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useSetActiveGroupMutation } from "@/services/api/react-query/users-queries";
import { useSnackbar } from "notistack";
import { Group, CreateGroupRequest } from "@/services/api/types/group";
import { Membership } from "@/services/api/types/membership";

// Type for pending invitation
type PendingInvitation = {
  _id: string;
  group: Group;
  role: string;
  status: string;
  token?: string;
};
import Link from "@/components/link";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import { GroupsListSkeleton } from "@/components/skeletons/GroupsListSkeleton";

// Component to fetch and display pending invitations count for a group
function PendingInvitationsCount({ groupId }: { groupId: string }) {
  const { t } = useTranslation("groups");
  const { data: membershipsData } = useGroupMembershipsQuery(groupId, {
    status: "pending",
  });
  const pendingCount =
    membershipsData?.results?.filter((m: Membership) => m.status === "pending")
      .length || 0;

  if (pendingCount === 0) return null;

  return (
    <Chip
      label={`${pendingCount} ${t("groups:invitations.title", { count: pendingCount })}`}
      size="small"
      color="warning"
      sx={{ marginLeft: (theme) => theme.spacing(2) }}
    />
  );
}

function GroupsPageContent() {
  const { t } = useTranslation("groups");
  const { user } = useAuth();
  const { setUser } = useAuthActions();
  const { enqueueSnackbar } = useSnackbar();
  const getGroupMemberships = useGetGroupMembershipsService();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newGroup, setNewGroup] = useState<CreateGroupRequest>({
    name: "",
    description: "",
    settings: {
      allowInvitations: true,
      requireApproval: false,
    },
  });

  const {
    data: groupsData,
    isLoading,
    error,
  } = useUserGroupsQuery(user?.id?.toString() || "");
  const createGroupMutation = useCreateGroupMutation();
  const acceptInvitationMutation = useAcceptInvitationMutation();
  const declineInvitationMutation = useDeclineInvitationMutation();
  const setActiveGroupMutation = useSetActiveGroupMutation();
  const deleteGroupMutation = useDeleteGroupMutation();

  // Don't render anything until user is loaded
  if (!user) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          {t("common:loading")}
        </Typography>
      </Container>
    );
  }

  const handleCreateGroup = async () => {
    if (!user?.id || !newGroup.name.trim()) return;

    // Omit description if it's empty to avoid API validation errors
    const requestData: CreateGroupRequest = {
      name: newGroup.name.trim(),
      settings: newGroup.settings,
      ...(newGroup.description?.trim() && {
        description: newGroup.description.trim(),
      }),
    };

    try {
      await createGroupMutation.mutateAsync(requestData);
      enqueueSnackbar(
        t("groups:actions.createGroupSuccess") || "Group created successfully",
        { variant: "success" }
      );
      setCreateDialogOpen(false);
      setNewGroup({
        name: "",
        description: "",
        settings: {
          allowInvitations: true,
          requireApproval: false,
        },
      });
    } catch (error) {
      console.error("Failed to create group:", error);
      enqueueSnackbar(
        t("groups:actions.createGroupError") || "Failed to create group",
        { variant: "error" }
      );
    }
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setNewGroup({
      name: "",
      description: "",
      settings: {
        allowInvitations: true,
        requireApproval: false,
      },
    });
  };

  const handleAcceptInvitation = async (invitation: PendingInvitation) => {
    if (!user?.id || !invitation.token) return;

    try {
      await acceptInvitationMutation.mutateAsync({
        token: invitation.token,
        data: {
          userId: user.id.toString(),
        },
      });
    } catch (error) {
      console.error("Failed to accept invitation:", error);
    }
  };

  const handleDeclineInvitation = async (invitation: PendingInvitation) => {
    if (!invitation.token) return;

    try {
      await declineInvitationMutation.mutateAsync(invitation.token);
    } catch (error) {
      console.error("Failed to decline invitation:", error);
    }
  };

  const handleSetAsActive = async (groupId: string) => {
    if (!user?.id) return;

    try {
      const updatedUser = await setActiveGroupMutation.mutateAsync({
        userId: user.id.toString(),
        groupId: groupId,
      });

      // Update the user data in auth context
      setUser(updatedUser);

      enqueueSnackbar(t("groups:actions.setAsDefaultSuccess"), {
        variant: "success",
      });
      handleMenuClose();
    } catch (error) {
      console.error("Failed to set group as active:", error);
      enqueueSnackbar(t("groups:actions.setAsDefaultError"), {
        variant: "error",
      });
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    groupId: string
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedGroupId(groupId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedGroupId(null);
  };

  const handleDeleteClick = (groupId: string) => {
    const group = transformedGroups.find((g) => g.id === groupId);
    if (!group) return;

    // Check if it's the default group
    if (user?.activeGroupId === groupId) {
      enqueueSnackbar(
        t("groups:actions.cannotDeleteDefaultGroup") ||
          "Cannot delete your default group",
        { variant: "error" }
      );
      handleMenuClose();
      return;
    }

    // Check if it's the only group
    if (transformedGroups.length <= 1) {
      enqueueSnackbar(
        t("groups:actions.cannotDeleteOnlyGroup") ||
          "Cannot delete your only group",
        { variant: "error" }
      );
      handleMenuClose();
      return;
    }

    setGroupToDelete({ id: groupId, name: group.name });
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return;

    // #region agent log
    // Check memberships before deletion
    try {
      const response = await getGroupMemberships(groupToDelete.id);
      const membershipsBefore =
        response.status === HTTP_CODES_ENUM.OK ? response.data : null;

      fetch(
        "http://127.0.0.1:7242/ingest/48f10dec-b30a-462e-ba72-a40a9e83d578",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "page-content.tsx:270",
            message: "Memberships before group deletion",
            data: {
              groupId: groupToDelete.id,
              groupName: groupToDelete.name,
              membershipsCount: membershipsBefore?.results?.length || 0,
              memberships: membershipsBefore?.results || [],
              membershipsResponseStatus: response.status,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "check-memberships-deletion",
            hypothesisId: "A",
          }),
        }
      ).catch(() => {});
    } catch (error) {
      fetch(
        "http://127.0.0.1:7242/ingest/48f10dec-b30a-462e-ba72-a40a9e83d578",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "page-content.tsx:295",
            message: "Error fetching memberships before deletion",
            data: {
              groupId: groupToDelete.id,
              error: error instanceof Error ? error.message : String(error),
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "check-memberships-deletion",
            hypothesisId: "A",
          }),
        }
      ).catch(() => {});
    }
    // #endregion

    try {
      await deleteGroupMutation.mutateAsync(groupToDelete.id);

      // #region agent log
      // Check memberships after deletion
      setTimeout(async () => {
        try {
          const response = await getGroupMemberships(groupToDelete.id);
          const membershipsAfter =
            response.status === HTTP_CODES_ENUM.OK ? response.data : null;

          fetch(
            "http://127.0.0.1:7242/ingest/48f10dec-b30a-462e-ba72-a40a9e83d578",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                location: "page-content.tsx:325",
                message: "Memberships after group deletion",
                data: {
                  groupId: groupToDelete.id,
                  membershipsCount: membershipsAfter?.results?.length || 0,
                  memberships: membershipsAfter?.results || [],
                  membershipsResponseStatus: response.status,
                  membershipsStillExist:
                    (membershipsAfter?.results?.length || 0) > 0,
                },
                timestamp: Date.now(),
                sessionId: "debug-session",
                runId: "check-memberships-deletion",
                hypothesisId: "B",
              }),
            }
          ).catch(() => {});
        } catch (error) {
          fetch(
            "http://127.0.0.1:7242/ingest/48f10dec-b30a-462e-ba72-a40a9e83d578",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                location: "page-content.tsx:350",
                message: "Error fetching memberships after deletion",
                data: {
                  groupId: groupToDelete.id,
                  error: error instanceof Error ? error.message : String(error),
                },
                timestamp: Date.now(),
                sessionId: "debug-session",
                runId: "check-memberships-deletion",
                hypothesisId: "B",
              }),
            }
          ).catch(() => {});
        }
      }, 1000); // Wait 1 second after deletion to check
      // #endregion

      enqueueSnackbar(
        t("groups:actions.deleteGroupSuccess") || "Group deleted successfully",
        { variant: "success" }
      );
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    } catch (error) {
      console.error("Failed to delete group:", error);
      enqueueSnackbar(
        t("groups:actions.deleteGroupError") || "Failed to delete group",
        { variant: "error" }
      );
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setGroupToDelete(null);
  };

  if (isLoading) {
    return <GroupsListSkeleton />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" color="error" sx={{ mt: 4, mb: 2 }}>
          Error loading groups: {error.message}
        </Typography>
      </Container>
    );
  }

  const groups = groupsData?.groupsByStatus?.active || [];
  const pendingInvitations = groupsData?.groupsByStatus?.pending || [];

  console.log("Frontend groups data debug:", {
    fullGroupsData: groupsData,
    activeGroups: groups,
    pendingInvitations: pendingInvitations,
    pendingInvitationsLength: pendingInvitations.length,
    groupsByStatus: groupsData?.groupsByStatus,
    pendingInvitationsWithTokens: pendingInvitations.map((inv) => ({
      _id: inv._id,
      token: inv.token,
      role: inv.role,
      status: inv.status,
    })),
  });

  // Transform the data to match frontend expectations
  const transformedGroups = groups
    .map((membership) => {
      // Type guard to ensure group_id is populated
      const group =
        typeof membership.group_id === "object" ? membership.group_id : null;
      if (!group) {
        console.warn("Group not populated in membership:", membership);
        return null;
      }

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        role: membership.role,
        createdAt: group.createdAt, // Use group's createdAt, not membership's
        updatedAt: group.updatedAt, // Use group's updatedAt, not membership's
        createdBy: group.createdBy,
        isPersonal: group.isPersonal,
        settings: group.settings,
        iconUrl: group.iconUrl,
      };
    })
    .filter((group): group is NonNullable<typeof group> => group !== null);

  const transformedPendingInvitations = pendingInvitations
    .map((membership) => {
      // Type guard to ensure group_id is populated
      const group =
        typeof membership.group_id === "object" ? membership.group_id : null;
      if (!group) {
        console.warn("Group not populated in pending invitation:", membership);
        return null;
      }

      return {
        _id: membership._id,
        group: group,
        role: membership.role,
        status: membership.status,
        token: membership.token || undefined,
      } as PendingInvitation;
    })
    .filter((invitation) => invitation !== null) as PendingInvitation[];

  return (
    <Container maxWidth="lg" className="mainContainer">
      <Grid
        container
        spacing={3}
        pt={3}
        direction="column"
        sx={{ minHeight: "60vh", alignItems: "start" }}
      >
        <Grid item xs={12} md={6}>
          <h1 style={{ marginTop: 0, textAlign: "left" }}>
            {t("groups:sections.active")} ({transformedGroups.length})
          </h1>
        </Grid>

        {/* Active Groups */}
        <Grid
          item
          lg={12}
          sx={{
            minWidth: {
              lg: ((transformedGroups.length % 3) + 2) * 250,
              md: ((transformedGroups.length % 2) + 2) * 200,
              sm: ((transformedGroups.length % 2) + 2) * 200,
            },
          }}
        >
          <Grid container spacing={3}>
            {transformedGroups.map((group) => (
              <Grid item xs={12} sm={6} md={6} lg={4} key={group.id}>
                <Card>
                  <CardContent
                    sx={{
                      flexDirection: "column",
                      alignItems: "start",
                      minHeight: 200,
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar
                        src={group.iconUrl}
                        variant="square"
                        sx={{
                          mr: 2,
                          bgcolor: group.iconUrl
                            ? "transparent"
                            : "primary.main",
                          width: 80,
                          height: 80,
                        }}
                      >
                        {!group.iconUrl &&
                          (group.name?.[0]?.toUpperCase() || "")}
                      </Avatar>
                      <Typography variant="h6" component="div">
                        {group.name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={group.role}
                          size="small"
                          sx={{ marginLeft: (theme) => theme.spacing(2) }}
                          color={
                            group.role === "admin"
                              ? "error"
                              : group.role === "editor"
                                ? "warning"
                                : "default"
                          }
                        />
                      </Box>
                    </Box>
                    {group.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {group.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {t("groups:info.created")}:{" "}
                      {new Date(group.createdAt).toLocaleDateString()}
                    </Typography>
                    {group.role === "admin" && (
                      <PendingInvitationsCount groupId={group.id} />
                    )}
                  </CardContent>
                  <CardActions>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                    >
                      {user?.activeGroupId === group.id && (
                        <Chip
                          label={t("groups:actions.defaultGroup")}
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        marginLeft="auto"
                      >
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, group.id)}
                          size="small"
                          aria-label="group actions"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            {/* Phantom "New Group" Card */}
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={4}
              key={0}
              sx={{ width: "100%" }}
            >
              <Card
                sx={{
                  cursor: "pointer",
                  border: "2px dashed",
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                  },
                  transition: "all 0.1s ease-in-out",
                }}
                onClick={() => setCreateDialogOpen(true)}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 235,
                    textAlign: "center",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: "transparent",
                      border: "2px dashed",
                      borderColor: "primary.main",
                      mb: 2,
                    }}
                  >
                    <AddIcon sx={{ fontSize: 40, color: "primary.main" }} />
                  </Avatar>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: 100 }}
                  >
                    {t("groups:actions.create")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            {transformedGroups.length === 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      align="center"
                    >
                      {t("groups:noActiveGroups")}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Group Actions Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {selectedGroupId && user?.activeGroupId !== selectedGroupId && (
            <MenuItem
              onClick={() =>
                selectedGroupId && handleSetAsActive(selectedGroupId)
              }
              disabled={setActiveGroupMutation.isPending}
            >
              {setActiveGroupMutation.isPending ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={16} />
                  {t("groups:actions.settingDefault")}
                </Box>
              ) : (
                t("groups:actions.setAsDefault")
              )}
            </MenuItem>
          )}
          {selectedGroupId &&
            transformedGroups.find((g) => g.id === selectedGroupId)?.role ===
              "admin" && (
              <MenuItem
                component={Link}
                href={`/groups/${selectedGroupId}`}
                onClick={handleMenuClose}
              >
                {t("groups:actions.open")}
              </MenuItem>
            )}
          {selectedGroupId &&
            transformedGroups.find((g) => g.id === selectedGroupId)?.role ===
              "admin" && (
              <MenuItem
                onClick={() =>
                  selectedGroupId && handleDeleteClick(selectedGroupId)
                }
                sx={{ color: "error.main" }}
              >
                <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                {t("groups:actions.delete")}
              </MenuItem>
            )}
        </Menu>

        {/* Pending Invitations */}
        {transformedPendingInvitations.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {t("groups:sections.pending")} (
              {transformedPendingInvitations.length})
            </Typography>
            <Grid container spacing={2}>
              {transformedPendingInvitations.map(
                (invitation: PendingInvitation) => (
                  <Grid item xs={12} sm={6} md={4} key={invitation._id}>
                    <Card
                      sx={{ border: "2px dashed", borderColor: "warning.main" }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar
                            src={invitation.group?.iconUrl}
                            sx={{
                              mr: 2,
                              bgcolor: invitation.group?.iconUrl
                                ? "transparent"
                                : "warning.main",
                              width: 56,
                              height: 56,
                            }}
                          >
                            {!invitation.group?.iconUrl && <GroupIcon />}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" component="div">
                              {invitation.group?.name}
                            </Typography>
                            <Chip
                              label="Pending"
                              size="small"
                              color="warning"
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Role: {invitation.role}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Status: {invitation.status}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleAcceptInvitation(invitation)}
                          disabled={
                            !invitation.token ||
                            acceptInvitationMutation.isPending ||
                            declineInvitationMutation.isPending
                          }
                          startIcon={
                            acceptInvitationMutation.isPending ? (
                              <CircularProgress size={14} color="inherit" />
                            ) : null
                          }
                        >
                          {acceptInvitationMutation.isPending
                            ? t("groups:actions.accepting")
                            : t("groups:actions.accept")}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeclineInvitation(invitation)}
                          disabled={
                            !invitation.token ||
                            acceptInvitationMutation.isPending ||
                            declineInvitationMutation.isPending
                          }
                          startIcon={
                            declineInvitationMutation.isPending ? (
                              <CircularProgress size={14} color="inherit" />
                            ) : null
                          }
                        >
                          {declineInvitationMutation.isPending
                            ? t("groups:actions.declining")
                            : t("groups:actions.decline")}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                )
              )}
            </Grid>
          </Grid>
        )}

        {/* Delete Group Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {t("groups:actions.deleteGroupConfirm") || "Delete Group"}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {t("groups:actions.deleteGroupMessage") ||
                "Are you sure you want to delete this group? This action cannot be undone."}
            </Typography>
            {groupToDelete && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                <strong>{groupToDelete.name}</strong>
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>
              {t("groups:actions.cancel")}
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              disabled={deleteGroupMutation.isPending}
              startIcon={
                deleteGroupMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <DeleteIcon />
                )
              }
            >
              {deleteGroupMutation.isPending
                ? t("groups:actions.deleting")
                : t("groups:actions.delete")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Group Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t("groups:dialog.createTitle")}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t("groups:form.name")}
              fullWidth
              variant="outlined"
              value={newGroup.name}
              onChange={(e) =>
                setNewGroup({ ...newGroup, name: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label={t("groups:form.description")}
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={newGroup.description}
              onChange={(e) =>
                setNewGroup({ ...newGroup, description: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newGroup.settings?.allowInvitations ?? true}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      settings: {
                        allowInvitations: e.target.checked,
                        requireApproval:
                          newGroup.settings?.requireApproval ?? false,
                      },
                    })
                  }
                />
              }
              label={t("groups:form.allowInvitations")}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newGroup.settings?.requireApproval ?? false}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      settings: {
                        allowInvitations:
                          newGroup.settings?.allowInvitations ?? true,
                        requireApproval: e.target.checked,
                      },
                    })
                  }
                />
              }
              label={t("groups:form.requireApproval")}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              {t("groups:actions.cancel")}
            </Button>
            <Button
              onClick={handleCreateGroup}
              variant="contained"
              disabled={!newGroup.name.trim() || createGroupMutation.isPending}
              startIcon={
                createGroupMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              {createGroupMutation.isPending
                ? t("groups:actions.creating") || "Criando..."
                : t("groups:actions.create")}
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(GroupsPageContent, {
  roles: [RoleEnum.ADMIN, RoleEnum.USER],
});
