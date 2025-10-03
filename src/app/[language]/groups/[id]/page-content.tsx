"use client";

import { useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";

import Box from "@mui/material/Box";
import useAuth from "@/services/auth/use-auth";
import { useGroupQuery } from "@/services/api/react-query/groups-queries";
import {
  useGroupMembershipsQuery,
  useCreateInvitationMutation,
  useUpdateRoleMutation,
  useRemoveMemberMutation,
} from "@/services/api/react-query/memberships-queries";
import { Membership } from "@/services/api/types/membership";
import { CreateInvitationRequest } from "@/services/api/types/membership";
import Link from "@/components/link";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface GroupDetailPageContentProps {
  params: { [key: string]: string | undefined };
}

function GroupDetailPageContent({ params }: GroupDetailPageContentProps) {
  const groupId = params.id!;
  const { t } = useTranslation("groups");
  const { user } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newInvitation, setNewInvitation] = useState<CreateInvitationRequest>({
    group_id: groupId,
    invitee_phone: "",
    invited_by: user?.id?.toString() || "",
    role: "contributor", // All users are invited as contributors by default
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMembership, setSelectedMembership] =
    useState<Membership | null>(null);

  const {
    data: group,
    isLoading: groupLoading,
    error: groupError,
  } = useGroupQuery(groupId);
  const { data: membershipsData } = useGroupMembershipsQuery(groupId);

  const createInvitationMutation = useCreateInvitationMutation();
  const updateRoleMutation = useUpdateRoleMutation();
  const removeMemberMutation = useRemoveMemberMutation();

  const handleInviteUser = async () => {
    console.log({ newInvitation });
    if (!newInvitation.invitee_phone.trim()) return;

    try {
      await createInvitationMutation.mutateAsync({
        ...newInvitation,
        invitee_phone: newInvitation.invitee_phone.trim(),
      });

      setInviteDialogOpen(false);
      setNewInvitation({
        group_id: groupId,
        invitee_phone: "",
        invited_by: user?.id?.toString() || "",
        role: "contributor", // All users are invited as contributors by default
      });
    } catch (error) {
      console.error("Failed to invite user:", error);
    }
  };

  const handleCloseInviteDialog = () => {
    setInviteDialogOpen(false);
    setNewInvitation({
      group_id: groupId,
      invitee_phone: "",
      invited_by: user?.id?.toString() || "",
      role: "contributor", // All users are invited as contributors by default
    });
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    membership: Membership
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedMembership(membership);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMembership(null);
  };

  const handleUpdateRole = async (
    newRole: "admin" | "editor" | "contributor"
  ) => {
    if (!selectedMembership || !user?.id) return;

    try {
      await updateRoleMutation.mutateAsync({
        membershipId: selectedMembership._id,
        data: {
          newRole,
          updaterId: user.id.toString(),
        },
      });
      handleMenuClose();
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMembership || !user?.id) return;

    try {
      await removeMemberMutation.mutateAsync({
        membershipId: selectedMembership._id,
        data: {
          removerId: user.id.toString(),
        },
      });
      handleMenuClose();
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  if (groupLoading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Loading group...
        </Typography>
      </Container>
    );
  }

  if (groupError || !group) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" color="error" sx={{ mt: 4, mb: 2 }}>
          Error loading group: {groupError?.message || "Group not found"}
        </Typography>
      </Container>
    );
  }

  const memberships = membershipsData?.results || [];
  const activeMembers = memberships.filter(
    (m: Membership) => m.status === "active"
  );

  const pendingInvitations = memberships.filter(
    (m: Membership) => m.status === "pending"
  );
  const userMembership = activeMembers.find(
    (m: Membership) =>
      (typeof m.user_id === "object" ? m.user_id.id : m.user_id) === user?.id
  );
  const canManage = userMembership?.role === "admin";
  console.log({ activeMembers, user });
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Header */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" mb={2}>
            <Button
              component={Link}
              href="/groups"
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 2 }}
            >
              {t("actions.back")}
            </Button>
            <Box flex={1}>
              <Typography variant="h3">{group.name}</Typography>
              {group.description && (
                <Typography variant="body1" color="text.secondary">
                  {group.description}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {t("groups:info.created")}:{" "}
                {new Date(group.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                component={Link}
                href={`/groups/${groupId}/lists`}
                variant="outlined"
                color="primary"
              >
                View Lists
              </Button>
              {canManage && (
                <Button
                  variant="contained"
                  onClick={() => setInviteDialogOpen(true)}
                  color="primary"
                >
                  {t("groups:actions.invite")}
                </Button>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Members */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {t("groups:members.title")} ({activeMembers.length})
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("groups:members.name")}</TableCell>
                  <TableCell>{t("groups:members.role")}</TableCell>
                  <TableCell>{t("groups:members.joined")}</TableCell>
                  <TableCell align="right">
                    {t("groups:members.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeMembers.map((membership: Membership) => (
                  <TableRow key={membership._id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                          {(typeof membership.user_id === "object"
                            ? membership.user_id?.firstName?.[0]
                            : null) ||
                            membership.invitee_phone?.[0] ||
                            "?"}
                        </Avatar>
                        <Typography>
                          {typeof membership.user_id === "object" &&
                          membership.user_id
                            ? `${membership.user_id.firstName} ${membership.user_id.lastName}`
                            : membership.invitee_phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={membership.role}
                        size="small"
                        color={
                          membership.role === "admin"
                            ? "error"
                            : membership.role === "editor"
                              ? "warning"
                              : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(
                        membership.accepted_at || membership.createdAt
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      {canManage &&
                        (typeof membership.user_id === "object"
                          ? membership.user_id.id
                          : membership.user_id) !== user?.id && (
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, membership)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {t("groups:invitations.title")} ({pendingInvitations.length})
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("groups:invitations.phone")}</TableCell>
                    <TableCell>{t("groups:invitations.role")}</TableCell>
                    <TableCell>{t("groups:invitations.invited")}</TableCell>
                    <TableCell align="right">
                      {t("groups:invitations.actions")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingInvitations.map((invitation: Membership) => (
                    <TableRow key={invitation._id}>
                      <TableCell>{invitation.invitee_phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={invitation.role}
                          size="small"
                          color={
                            invitation.role === "admin"
                              ? "error"
                              : invitation.role === "editor"
                                ? "warning"
                                : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        {canManage && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => {
                              // Handle cancel invitation
                            }}
                          >
                            {t("groups:invitations.cancel")}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}

        {/* Invite User Dialog */}
        <Dialog
          open={inviteDialogOpen}
          onClose={handleCloseInviteDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t("groups:dialog.inviteTitle")}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t("groups:form.phone")}
              type="tel"
              fullWidth
              variant="outlined"
              value={newInvitation.invitee_phone}
              onChange={(e) =>
                setNewInvitation({
                  ...newInvitation,
                  invitee_phone: e.target.value,
                })
              }
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseInviteDialog}>
              {t("actions.cancel")}
            </Button>
            <Button
              onClick={handleInviteUser}
              variant="contained"
              disabled={
                !newInvitation.invitee_phone.trim() ||
                createInvitationMutation.isPending
              }
            >
              {createInvitationMutation.isPending
                ? t("actions.inviting")
                : t("actions.invite")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Member Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleUpdateRole("admin")}>
            {t("groups:actions.makeAdmin")}
          </MenuItem>
          <MenuItem onClick={() => handleUpdateRole("editor")}>
            {t("groups:actions.makeEditor")}
          </MenuItem>
          <MenuItem onClick={() => handleUpdateRole("contributor")}>
            {t("groups:actions.makeContributor")}
          </MenuItem>
          <MenuItem onClick={handleRemoveMember} sx={{ color: "error.main" }}>
            {t("groups:actions.remove")}
          </MenuItem>
        </Menu>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(GroupDetailPageContent, {
  roles: [RoleEnum.ADMIN, RoleEnum.USER],
});
