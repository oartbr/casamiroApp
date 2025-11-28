"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";
import useAuth from "@/services/auth/use-auth";
import {
  useInvitationByTokenQuery,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
} from "@/services/api/react-query/memberships-queries";
import { hasReturningUserCookie } from "@/services/auth/returning-user-cookie";
import useLanguage from "@/services/i18n/use-language";

interface InvitePageContentProps {
  params: { token?: string; language?: string };
}

function InvitePageContent({ params }: InvitePageContentProps) {
  const token = params.token || ""; // this is the invitation token
  const { t } = useTranslation("groups");
  const router = useRouter();
  const { user, isLoaded } = useAuth();
  const language = useLanguage();
  const returningUser = hasReturningUserCookie();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } =
    useInvitationByTokenQuery(token);
  const acceptInvitationMutation = useAcceptInvitationMutation();
  const declineInvitationMutation = useDeclineInvitationMutation();

  const group = useMemo(() => {
    if (!data) return null;
    if (typeof data.group_id === "object") {
      return data.group_id;
    }
    return null;
  }, [data]);

  const invitedBy = useMemo(() => {
    if (!data) return null;
    if (typeof data.invited_by === "object") {
      return data.invited_by;
    }
    return null;
  }, [data]);

  const handleAccept = async () => {
    if (!token) return;

    // If user is not logged in, redirect to login with returnTo parameter
    if (isLoaded && !user) {
      const currentPath = window.location.pathname;
      const returnTo = encodeURIComponent(currentPath);
      router.push(`/${language}/check-phone-number?returnTo=${returnTo}`);
      return;
    }

    if (!user?.id) return;

    try {
      setActionError(null);
      const membership = await acceptInvitationMutation.mutateAsync({
        token,
        data: {
          userId: user.id.toString(),
        },
      });

      const groupId =
        typeof membership.group_id === "string"
          ? membership.group_id
          : membership.group_id?.id;

      router.push(groupId ? `/groups/${groupId}` : "/groups");
    } catch (err) {
      console.error("Failed to accept invitation:", err);
      setActionError(
        err instanceof Error ? err.message : "Unable to accept invitation."
      );
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    try {
      setActionError(null);
      await declineInvitationMutation.mutateAsync(token);
      router.push("/groups");
    } catch (err) {
      console.error("Failed to decline invitation:", err);
      setActionError(
        err instanceof Error ? err.message : "Unable to decline invitation."
      );
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}></Container>
    );
  }

  if (isError || !data) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {t("groups:invitations.title")}
            </Typography>
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error instanceof Error
                ? error.message
                : t("invitations.notFoundOrAlreadyUsed")}
            </Alert>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={() => refetch()}>
                {t("groups:actions.retry")}
              </Button>
              <Button variant="text" onClick={() => router.push("/groups")}>
                {t("groups:actions.back")}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {t("groups:invitations.title", {
              firstName: invitedBy?.firstName,
              groupName: group?.name,
            })}
          </Typography>
          <Divider sx={{ my: 2 }} />
        </CardContent>
        <CardActions sx={{ p: 3, pt: 0, flexDirection: "column", gap: 2 }}>
          {actionError && (
            <Alert severity="error" sx={{ alignSelf: "stretch" }}>
              {actionError}
            </Alert>
          )}
          {isLoaded && !user && (
            <Alert severity="info" sx={{ alignSelf: "stretch" }}>
              {t("groups:invitations.loginRequired")}
            </Alert>
          )}
          <Stack direction="row" spacing={2} width="100%">
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleAccept}
              disabled={
                acceptInvitationMutation.isPending ||
                declineInvitationMutation.isPending ||
                !isLoaded ||
                (isLoaded && !user)
              }
              startIcon={
                acceptInvitationMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              {acceptInvitationMutation.isPending
                ? t("groups:actions.loading")
                : t("groups:actions.accept")}
            </Button>
            {user && (
              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={handleDecline}
                disabled={
                  acceptInvitationMutation.isPending ||
                  declineInvitationMutation.isPending
                }
                startIcon={
                  declineInvitationMutation.isPending ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
              >
                {declineInvitationMutation.isPending
                  ? t("groups:actions.loading")
                  : t("groups:actions.reject")}
              </Button>
            )}
          </Stack>
          {!user && returningUser ? (
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => {
                const currentPath = window.location.pathname;
                const returnTo = encodeURIComponent(currentPath);
                router.push(
                  `/${language}/check-phone-number?returnTo=${returnTo}`
                );
              }}
            >
              {t("invitations.loginToAccept")}
            </Button>
          ) : !user ? (
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => {
                const currentPath = window.location.pathname;
                const returnTo = encodeURIComponent(currentPath);
                router.push(`/${language}/sign-up?returnTo=${returnTo}`);
              }}
            >
              {t("invitations.signUpToAccept")}
            </Button>
          ) : null}
        </CardActions>
      </Card>
    </Container>
  );
}

export default InvitePageContent;
