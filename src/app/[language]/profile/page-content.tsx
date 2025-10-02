"use client";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Link from "@/components/link";
import { useTranslation } from "@/services/i18n/client";
import { useUserGroupsQuery } from "@/services/api/react-query/groups-queries";
import { useSetActiveGroupMutation } from "@/services/api/react-query/users-queries";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useState } from "react";

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(20),
  height: theme.spacing(20),
}));

function Profile() {
  const { user } = useAuth();
  const { setUser } = useAuthActions();
  const { t } = useTranslation("profile");
  const { data: groupsData } = useUserGroupsQuery(user?.id?.toString() || "");
  const setActiveGroupMutation = useSetActiveGroupMutation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const activeGroups = groupsData?.groupsByStatus?.active || [];
  const pendingInvitations = groupsData?.groupsByStatus?.pending || [];

  const handleActiveGroupChange = async (groupId: string) => {
    if (!user?.id) return;

    try {
      const updatedUser = await setActiveGroupMutation.mutateAsync({
        userId: user.id.toString(),
        groupId: groupId,
      });

      // Update the user data in auth context
      setUser(updatedUser);

      setSnackbarMessage("Active group updated successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Failed to update active group");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md">
      <Grid container spacing={3} pt={3}>
        {/* User Info */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} direction="column" alignItems="center">
            <Grid item xs="auto">
              <StyledAvatar
                alt={user?.firstName + " " + user?.lastName}
                data-testid="user-icon"
                src={user?.photo?.toString()}
              />
            </Grid>
            <Grid item>
              <Typography
                variant="h3"
                gutterBottom
                data-testid="user-name"
                align="center"
              >
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography
                variant="h5"
                gutterBottom
                data-testid="user-email"
                align="center"
              >
                {user?.email}
              </Typography>
              <Grid container justifyContent="center">
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    LinkComponent={Link}
                    href="/profile/edit"
                    data-testid="edit-profile"
                  >
                    {t("profile:actions.edit")}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Groups Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Groups Summary
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Active Groups:
                </Typography>
                <Chip label={activeGroups.length} color="primary" />
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Pending Invitations:
                </Typography>
                <Chip label={pendingInvitations.length} color="warning" />
              </Box>
              {groupsData?.summary?.primaryGroup && (
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    Primary Group:
                  </Typography>
                  <Chip
                    label={groupsData.summary.primaryGroup.name}
                    color="success"
                    variant="outlined"
                  />
                </Box>
              )}

              {/* Active Group Selector */}
              {activeGroups.length > 0 && (
                <Box mb={2}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Active Group:
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Active Group</InputLabel>
                    <Select
                      value={user?.activeGroupId || ""}
                      onChange={(e) => handleActiveGroupChange(e.target.value)}
                      label="Select Active Group"
                      disabled={setActiveGroupMutation.isPending}
                    >
                      {activeGroups.map((membership: Membership) => (
                        <MenuItem
                          key={membership.group_id.id}
                          value={membership.group_id.id}
                        >
                          {membership.group_id.name} ({membership.role})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              <Button
                variant="outlined"
                color="primary"
                LinkComponent={Link}
                href="/groups"
                fullWidth
                sx={{ mt: 2 }}
              >
                Manage Groups
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Groups */}
        {activeGroups.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Your Groups
            </Typography>
            <Grid container spacing={2}>
              {activeGroups.map((membership: Membership) => (
                <Grid item xs={12} sm={6} md={4} key={membership._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {membership.group_id.name}
                      </Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mr: 1 }}
                        >
                          Role:
                        </Typography>
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
                      </Box>
                      {membership.group_id.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                        >
                          {membership.group_id.description}
                        </Typography>
                      )}
                      <Button
                        size="small"
                        component={Link}
                        href={`/groups/${membership.group_id.id}`}
                        sx={{ mt: 1 }}
                      >
                        View Group
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Pending Invitations
            </Typography>
            <Grid container spacing={2}>
              {pendingInvitations.map((invitation: Membership) => (
                <Grid item xs={12} sm={6} md={4} key={invitation._id}>
                  <Card
                    sx={{ border: "2px dashed", borderColor: "warning.main" }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {invitation.group_id?.name}
                      </Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mr: 1 }}
                        >
                          Role:
                        </Typography>
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
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        Invited:{" "}
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </Typography>
                      <Button
                        size="small"
                        color="success"
                        component={Link}
                        href={`/invitations/${invitation.token}`}
                        sx={{ mt: 1 }}
                      >
                        Respond to Invitation
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default withPageRequiredAuth(Profile);
