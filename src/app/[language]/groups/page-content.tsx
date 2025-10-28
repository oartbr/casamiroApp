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
import useAuth from "@/services/auth/use-auth";
import {
  useUserGroupsQuery,
  useCreateGroupMutation,
} from "@/services/api/react-query/groups-queries";
import {
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
} from "@/services/api/react-query/memberships-queries";
import { Group, CreateGroupRequest } from "@/services/api/types/group";

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

function GroupsPageContent() {
  const { t } = useTranslation("groups");
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
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

    try {
      await createGroupMutation.mutateAsync({
        ...newGroup,
        name: newGroup.name.trim(),
      });

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

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          {t("common:loading")}
        </Typography>
      </Container>
    );
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
    <Container maxWidth="lg">
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Header */}
        <Grid item xs={12}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h3">{t("groups:title")}</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              color="primary"
            >
              {t("groups:actions.create")}
            </Button>
          </Box>
        </Grid>

        {/* Active Groups */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {t("groups:sections.active")} ({transformedGroups.length})
          </Typography>
          <Grid container spacing={2}>
            {transformedGroups.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                        <GroupIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {group.name}
                        </Typography>
                        <Chip
                          label={group.role}
                          size="small"
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
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={Link}
                      href={`/groups/${group.id}`}
                    >
                      {t("groups:actions.view")}
                    </Button>
                    {group.role === "admin" && (
                      <Button
                        size="small"
                        component={Link}
                        href={`/groups/${group.id}/edit`}
                      >
                        {t("groups:actions.edit")}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
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
                          <Avatar sx={{ mr: 2, bgcolor: "warning.main" }}>
                            <GroupIcon />
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
                          color="success"
                          onClick={() => handleAcceptInvitation(invitation)}
                          disabled={
                            !invitation.token ||
                            acceptInvitationMutation.isPending ||
                            declineInvitationMutation.isPending
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
              {t("common:actions.cancel")}
            </Button>
            <Button
              onClick={handleCreateGroup}
              variant="contained"
              disabled={!newGroup.name.trim() || createGroupMutation.isPending}
            >
              {createGroupMutation.isPending
                ? t("common:actions.creating")
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
