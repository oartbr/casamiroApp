"use client";

import Button from "@mui/material/Button";
import ShareIcon from "@mui/icons-material/Share";
import { useTranslation } from "@/services/i18n/client";
import { useSnackbar } from "notistack";
import useAuth from "@/services/auth/use-auth";

interface ShareReferralButtonProps {
  referralCode: string;
  variant?: "text" | "outlined" | "contained";
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

export function ShareReferralButton({
  referralCode,
  variant = "contained",
  color = "primary",
  size = "medium",
  fullWidth = false,
}: ShareReferralButtonProps) {
  const { t } = useTranslation("referral");
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const getReferralLink = () => {
    if (typeof window === "undefined" || !referralCode) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/indique/${referralCode}`;
  };

  const shareReferralLink = (url: string, message: string) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      return navigator.share({
        title: t("referral:shareTitle"),
        text: message,
        url,
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

  const handleShareReferral = async () => {
    if (!referralCode) return;

    try {
      const referralLink = getReferralLink();
      if (!referralLink) {
        throw new Error(t("referral:invalidLink"));
      }

      const message = t("referral:shareMessage", {
        user: user?.firstName || t("referral:defaultUserName"),
      });

      await shareReferralLink(referralLink, message);
    } catch (error) {
      console.error("Failed to share referral link:", error);
      enqueueSnackbar(t("referral:unableToShareLink"), { variant: "error" });
    }
  };

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      startIcon={<ShareIcon />}
      onClick={handleShareReferral}
    >
      {t("referral:share")}
    </Button>
  );
}
