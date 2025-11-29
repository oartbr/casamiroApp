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

  console.log({ activeGroups });

  const handleActiveGroupChange = async (groupId: string) => {
    if (!user?.id) return;

    try {
      const updatedUser = await setActiveGroupMutation.mutateAsync({
        userId: user.id.toString(),
        groupId: groupId,
      });

      // Update the user data in auth context
      setUser(updatedUser);

      setSnackbarMessage(t("groups.activeGroupUpdatedSuccessfully"));
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage(t("groups.failedToUpdateActiveGroup"));
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
          {/* Active Group Selector */}
          {activeGroups.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
                <InputLabel>{t("groups.selectActiveGroup")}</InputLabel>
                <Select
                  value={user?.activeGroupId || ""}
                  onChange={(e) => handleActiveGroupChange(e.target.value)}
                  label={t("groups.selectActiveGroup")}
                  disabled={setActiveGroupMutation.isPending}
                >
                  {activeGroups.map((group) => (
                    <MenuItem key={group.group_id.id} value={group.group_id.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          src={group.group_id.iconUrl}
                          variant="square"
                          sx={{
                            mr: 2,
                            bgcolor: group.group_id.iconUrl
                              ? "transparent"
                              : "primary.main",
                            width: 56,
                            height: 56,
                          }}
                        >
                          {!group.group_id.iconUrl &&
                            (group.group_id.name?.[0]?.toUpperCase() || "")}
                        </Avatar>
                        <Typography variant="body2">
                          {group.group_id.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({group.role})
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="body1" sx={{ mr: 2, ml: 2 }}>
              {t("groups.activeGroups")}:
            </Typography>
            <Chip label={activeGroups.length} color="primary" />
          </Box>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="body1" sx={{ mr: 2, ml: 2 }}>
              {t("groups.pendingInvitations")}:
            </Typography>
            <Chip label={pendingInvitations.length} color="warning" />
          </Box>
          <Button
            variant="outlined"
            color="primary"
            LinkComponent={Link}
            href="/groups"
            fullWidth
            sx={{ mt: 2 }}
          >
            {t("actions.manageGroups")}
          </Button>
        </Grid>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Pending Invitations
            </Typography>
            <Grid container spacing={2}>
              {pendingInvitations.map((invitation) => (
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
                        Role: {invitation.role}
                      </Typography>
                      <Button
                        size="small"
                        color="success"
                        component={Link}
                        href={`/invitations/${invitation._id}`}
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
