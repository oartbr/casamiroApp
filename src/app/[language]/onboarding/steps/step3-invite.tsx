"use client";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import WhatsAppInviteButton from "@/components/groups/whatsapp-invite-button";
import { useTranslation } from "@/services/i18n/client";
import type { OnboardingStatusResponse } from "@/services/api/services/onboarding";

type Props = {
  onComplete: () => void;
  onboardingData: OnboardingStatusResponse;
};

export default function Step3Invite({ onComplete, onboardingData }: Props) {
  const { t } = useTranslation("onboarding");
  const activeGroup = onboardingData.activeGroup;
  const onboardingContext = onboardingData.onboardingContext;

  // Get the subtitle key based on onboarding context
  const getSubtitleKey = () => {
    if (!onboardingContext) return "step3.subtitle_casa"; // default fallback
    return `step3.subtitle_${onboardingContext}`;
  };

  if (!activeGroup) {
    return (
      <Box>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ mb: 3, fontWeight: "100" }}
        >
          {t("step3.title")}
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 4, color: "text.secondary", fontWeight: "100" }}
        >
          {t("step3.error.groupNotFound")}
        </Typography>
        <Button variant="text" size="medium" onClick={onComplete}>
          {t("step3.skip")}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 3, fontWeight: "100" }}
      >
        {t("step3.title")}
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 4, color: "text.secondary", fontWeight: "100" }}
      >
        {t(getSubtitleKey())}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <WhatsAppInviteButton
          groupId={activeGroup.id}
          groupName={activeGroup.name}
          variant="contained"
          size="large"
          fullWidth
        >
          {t("step3.inviteWhatsApp")}
        </WhatsAppInviteButton>

        <Button variant="text" size="medium" onClick={onComplete}>
          {t("step3.skip")}
        </Button>
      </Box>
    </Box>
  );
}
