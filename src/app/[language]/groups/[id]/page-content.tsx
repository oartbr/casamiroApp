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
import Skeleton from "@mui/material/Skeleton";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";

import Box from "@mui/material/Box";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import { useGroupQuery } from "@/services/api/react-query/groups-queries";
import {
  useGroupMembershipsQuery,
  useCreateInvitationMutation,
  useUpdateRoleMutation,
  useRemoveMemberMutation,
  useCancelInvitationMutation,
} from "@/services/api/react-query/memberships-queries";
import { useSetActiveGroupMutation } from "@/services/api/react-query/users-queries";
import { useQueryClient } from "@tanstack/react-query";
import { Membership } from "@/services/api/types/membership";
import Link from "@/components/link";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { RoleEnum } from "@/services/api/types/role";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSnackbar } from "notistack";
import { GroupDetailSkeleton } from "@/components/skeletons/GroupDetailSkeleton";

type MembershipWithOptionalId = Membership & { id?: string };

const getMembershipId = (membership: MembershipWithOptionalId) =>
  membership._id || membership.id || "";

interface GroupDetailPageContentProps {
  params: { [key: string]: string | undefined };
}

function GroupDetailPageContent({ params }: GroupDetailPageContentProps) {
  const groupId = params.id!;
  const { t } = useTranslation("groups");
  const { user } = useAuth();
  const { setUser } = useAuthActions();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMembership, setSelectedMembership] =
    useState<Membership | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const {
    data: group,
    isLoading: groupLoading,
    error: groupError,
  } = useGroupQuery(groupId);
  const {
    data: membershipsData,
    isLoading: membershipsLoading,
    error: membershipsError,
  } = useGroupMembershipsQuery(groupId, { limit: 100 });
  const createInvitationMutation = useCreateInvitationMutation();
  const updateRoleMutation = useUpdateRoleMutation();
  const removeMemberMutation = useRemoveMemberMutation();
  const cancelInvitationMutation = useCancelInvitationMutation();
  const setActiveGroupMutation = useSetActiveGroupMutation();

  const shareInvitationLink = (url: string, message: string) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      // Include URL in text for better WhatsApp compatibility
      const shareText = `${message}`;
      return navigator.share({
        title: t("groups:invitations.invite"),
        text: shareText,
        url, // Keep url property for other apps
      });
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      `${message}\n\n${url}`
    )}`;
    const opened = window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    if (!opened && navigator.clipboard) {
      return navigator.clipboard.writeText(`${message}\n\n${url}`);
    }

    return Promise.resolve();
  };

  const handleShareInvite = async () => {
    if (!group || !user?.id) return;
    console.log({ group, user });
    try {
      setShareError(null);
      const invitation = await createInvitationMutation.mutateAsync({
        group_id: groupId,
        invited_by: user.id.toString(),
        role: "contributor",
      });

      // Manually invalidate all group memberships queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["memberships", "list", "byGroup", groupId],
      });

      const identifier = invitation.token || invitation._id;
      if (!identifier) {
        throw new Error(t("groups:invitations.missingToken"));
      }

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const invitationUrl = `${
        origin || process.env.NEXT_PUBLIC_APP_URL || "https://casamiro.ai"
      }/invite/${identifier}`;
      const message = t("groups:invitations.joinGroup", { group: group.name });

      await shareInvitationLink(invitationUrl, message);
    } catch (error) {
      console.error("Failed to trigger share:", error);
      setShareError(t("groups:invitations.unableToShareLink"));
    }
  };

  const handleShareExistingInvitation = async (invitation: Membership) => {
    if (!group) return;
    const invitationId = getMembershipId(
      invitation as MembershipWithOptionalId
    );

    try {
      setShareError(null);
      const identifier = invitation.token || invitationId;
      if (!identifier) {
        throw new Error(t("groups:invitations.missingToken"));
      }
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const invitationUrl = `${
        origin || process.env.NEXT_PUBLIC_APP_URL || "https://casamiro.ai"
      }/invite/${identifier}`;
      const message = t("groups:invitations.joinGroup", { group: group.name });

      await shareInvitationLink(invitationUrl, message);
    } catch (error) {
      console.error("Failed to share invitation link:", error);
      setShareError(t("groups:invitations.unableToShareLink"));
    }
  };

  const handleCancelInvitation = async (invitation: Membership) => {
    if (!user?.id) return;
    const invitationId = getMembershipId(
      invitation as MembershipWithOptionalId
    );
    if (!invitationId) {
      console.error("Missing invitation id");
      return;
    }

    try {
      setShareError(null);
      setCancelTargetId(invitationId);
      await cancelInvitationMutation.mutateAsync({
        membershipId: invitationId,
        data: {
          cancellerId: user.id.toString(),
        },
      });

      // Manually invalidate all group memberships queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["memberships", "list", "byGroup", groupId],
      });

      enqueueSnackbar(t("groups:invitations.cancelSuccess"), {
        variant: "success",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("groups:invitations.unableToCancelInvitation");
      console.error("Failed to cancel invitation:", {
        error,
        invitationId,
        groupId,
        userId: user?.id,
        errorMessage,
      });
      setShareError(errorMessage);
      enqueueSnackbar(t("groups:invitations.cancelError"), {
        variant: "error",
      });
    } finally {
      setCancelTargetId(null);
    }
  };

  const handleSetAsDefault = async () => {
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
    } catch (error) {
      console.error("Failed to set group as default:", error);
      enqueueSnackbar(t("groups:actions.setAsDefaultError"), {
        variant: "error",
      });
    }
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
    return <GroupDetailSkeleton />;
  }

  if (groupError || !group) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" color="error" sx={{ mt: 4, mb: 2 }}>
          {t("groups:error.loadingGroup")}:{" "}
          {groupError?.message || t("groups:error.groupNotFound")}
        </Typography>
      </Container>
    );
  }

  const memberships = membershipsData?.results || [];

  // Debug logging
  console.log("Memberships data:", {
    membershipsData,
    memberships,
    membershipsCount: memberships.length,
    membershipsLoading,
    membershipsError,
    groupId,
    user: user?.id,
  });

  const activeMembers = memberships.filter(
    (m: Membership) => m.status === "active"
  );

  const pendingInvitations = memberships.filter(
    (m: Membership) => m.status === "pending"
  );

  console.log("Filtered members:", {
    activeMembers,
    activeMembersCount: activeMembers.length,
    pendingInvitations,
    pendingInvitationsCount: pendingInvitations.length,
  });

  // Helper to get user ID from membership, handling both object and string/number types
  const getMembershipUserId = (m: Membership): string | null => {
    if (!m.user_id) return null;
    if (typeof m.user_id === "object") {
      return m.user_id.id?.toString() || null;
    }
    return m.user_id.toString();
  };

  const userMembership = activeMembers.find((m: Membership) => {
    const membershipUserId = getMembershipUserId(m);
    const currentUserId = user?.id?.toString();
    return membershipUserId === currentUserId;
  });
  const canManage = userMembership?.role === "admin";
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Header */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" mb={2}>
            <Box>
              <Avatar
                src={group.iconUrl}
                variant="square"
                sx={{
                  mr: 2,
                  bgcolor: group.iconUrl ? "transparent" : "primary.main",
                  width: 80,
                  height: 80,
                }}
              ></Avatar>
            </Box>
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
            {shareError && (
              <Typography
                variant="body2"
                color="error"
                sx={{ mt: 1, width: "100%" }}
              >
                {shareError}
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Members */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {t("groups:members.title")} ({activeMembers.length})
          </Typography>
          {membershipsError && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {t("groups:error.loadingMembers")}:{" "}
              {membershipsError.message || t("groups:error.unknownError")}
            </Typography>
          )}
          {membershipsLoading && (
            <TableContainer component={Paper} sx={{ mb: 2 }}>
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
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Skeleton variant="circular" width={32} height={32} />
                          <Skeleton variant="text" width={120} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={80} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={100} />
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton variant="circular" width={40} height={40} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
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
                {activeMembers.map((membership: Membership) => {
                  // Get photo URL - photo can be a string (URL) or FileEntity
                  const getPhotoUrl = () => {
                    if (
                      typeof membership.user_id === "object" &&
                      membership.user_id?.photo
                    ) {
                      // If photo is a string, use it directly
                      if (typeof membership.user_id.photo === "string") {
                        return membership.user_id.photo;
                      }
                      // If photo is a FileEntity object, use the path
                      if (
                        typeof membership.user_id.photo === "object" &&
                        "path" in membership.user_id.photo
                      ) {
                        return membership.user_id.photo.path;
                      }
                    }
                    return undefined;
                  };

                  const photoUrl = getPhotoUrl();

                  return (
                    <TableRow key={membership._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            src={photoUrl}
                            sx={{ mr: 2, width: 32, height: 32 }}
                            onError={() => {
                              console.error("Avatar image failed to load:", {
                                photo: photoUrl,
                                user_id: membership.user_id,
                              });
                            }}
                          >
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
                          label={
                            membership.role === "admin"
                              ? t("groups:roles.admin")
                              : membership.role === "editor"
                                ? t("groups:roles.editor")
                                : membership.role === "contributor"
                                  ? t("groups:roles.contributor")
                                  : membership.role === "viewer"
                                    ? t("groups:roles.viewer")
                                    : membership.role
                          }
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
                          getMembershipUserId(membership) !==
                            user?.id?.toString() && (
                            <IconButton
                              onClick={(e) => handleMenuOpen(e, membership)}
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        {/* Pending Invitations */}
        {(pendingInvitations.length > 0 || canManage) && (
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {t("groups:invitations.title", {
                count: pendingInvitations.length,
              })}{" "}
              ({pendingInvitations.length})
            </Typography>
            {pendingInvitations.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("groups:invitations.expires")}</TableCell>
                      <TableCell align="right">
                        {t("groups:invitations.actions")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingInvitations.map((invitation: Membership) => {
                      const invitationId = getMembershipId(
                        invitation as MembershipWithOptionalId
                      );
                      const isCancelling =
                        !!invitationId && cancelTargetId === invitationId;

                      // Check if user is admin or created this invitation
                      const invitedByUserId =
                        typeof invitation.invited_by === "object"
                          ? invitation.invited_by.id
                          : invitation.invited_by;
                      const canManageInvitation =
                        canManage || invitedByUserId === user?.id?.toString();

                      return (
                        <TableRow key={invitationId || invitation.token}>
                          <TableCell>
                            {invitation.expiration_date
                              ? new Date(
                                  invitation.expiration_date
                                ).toLocaleDateString()
                              : t("groups:invitations.noExpiration")}
                          </TableCell>
                          <TableCell align="right">
                            {canManageInvitation && (
                              <Box
                                display="flex"
                                gap={1}
                                justifyContent="flex-end"
                              >
                                <Button
                                  size="small"
                                  onClick={() =>
                                    handleShareExistingInvitation(invitation)
                                  }
                                >
                                  {t("groups:invitations.resendLink")}
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleCancelInvitation(invitation)
                                  }
                                  disabled={isCancelling}
                                >
                                  {isCancelling
                                    ? t("groups:actions.canceling")
                                    : t("groups:invitations.cancel")}
                                </Button>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              canManage && (
                <Typography variant="body2" color="text.secondary">
                  {t("groups:noPendingInvitations")}
                </Typography>
              )
            )}
          </Grid>
        )}
        <Grid item xs={12}>
          <Box display="flex" gap={1}>
            <Button
              component={Link}
              href="/groups"
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 2 }}
            >
              {t("actions.back")}
            </Button>
            {/* <Button
              component={Link}
              href={`/groups/${groupId}/lists`}
              variant="outlined"
              color="primary"
            >
              {t("groups:actions.viewLists")}
            </Button> */}
            {canManage && (
              <Button
                variant="contained"
                onClick={handleShareInvite}
                color="primary"
                disabled={createInvitationMutation.isPending}
                startIcon={
                  createInvitationMutation.isPending ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
              >
                {createInvitationMutation.isPending
                  ? t("actions.inviting")
                  : t("groups:actions.invite")}
              </Button>
            )}
            {user?.activeGroupId !== groupId && (
              <Button
                variant="outlined"
                onClick={handleSetAsDefault}
                color="primary"
                disabled={setActiveGroupMutation.isPending}
                startIcon={
                  setActiveGroupMutation.isPending ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
              >
                {setActiveGroupMutation.isPending
                  ? t("groups:actions.settingDefault")
                  : t("groups:actions.setAsDefault")}
              </Button>
            )}
            {user?.activeGroupId === groupId && (
              <Chip
                label={t("groups:actions.defaultGroup")}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Grid>

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
