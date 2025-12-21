"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useSnackbar } from "notistack";
import { useTranslation } from "@/services/i18n/client";
import useAuth from "@/services/auth/use-auth";
import useLanguage from "@/services/i18n/use-language";
import { useCreateInvitationService } from "@/services/api/services/memberships";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

type Props = {
  groupId: string;
  groupName: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  variant?: "contained" | "outlined" | "text";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  children?: React.ReactNode;
};

export default function WhatsAppInviteButton({
  groupId,
  groupName,
  onSuccess,
  onError,
  variant = "contained",
  size = "large",
  fullWidth = false,
  color = "primary",
  children,
}: Props) {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation("groups");
  const language = useLanguage();
  const createInvitation = useCreateInvitationService();
  const [loading, setLoading] = useState(false);

  const shareInvitationLink = (url: string, message: string) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      // Include URL in text for better WhatsApp compatibility
      const shareText = `${message}`;
      return navigator.share({
        title: t("groups:invitations.invite", {
          user: user?.firstName,
        }),
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

  const handleInvite = async () => {
    if (!user?.id) {
      enqueueSnackbar("Usuário não encontrado", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await createInvitation({
        group_id: groupId,
        invited_by: String(user.id),
        role: "contributor",
      });

      if (response.status === HTTP_CODES_ENUM.CREATED && response.data) {
        const identifier = response.data.token || response.data._id;
        if (!identifier) {
          throw new Error(t("groups:invitations.missingToken"));
        }

        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const invitationUrl = `${
          origin || process.env.NEXT_PUBLIC_APP_URL || "https://casamiro.ai"
        }/${language}/invite/${identifier}`;

        const message = t("groups:invitations.joinGroup", {
          group: groupName,
          user: user?.firstName,
        });

        await shareInvitationLink(invitationUrl, message);
        enqueueSnackbar("WhatsApp aberto com o convite", {
          variant: "success",
        });
        onSuccess?.();
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error creating invitation:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("groups:invitations.unableToShareLink");
      enqueueSnackbar(errorMessage, { variant: "error" });
      if (error instanceof Error) {
        onError?.(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      color={color}
      onClick={handleInvite}
      disabled={loading || !user?.id}
      fullWidth={fullWidth}
      startIcon={
        loading ? <CircularProgress size={16} color="inherit" /> : null
      }
    >
      {loading
        ? t("actions.inviting", { defaultValue: "Convidando..." })
        : children ||
          t("groups:actions.invite", {
            defaultValue: "Convidar pelo WhatsApp",
          })}
    </Button>
  );
}
