"use client";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTranslation } from "@/services/i18n/client";
import { ReferralStats } from "@/components/referral/referral-stats";
import type { OnboardingStatusResponse } from "@/services/api/services/onboarding";

type Props = {
  onComplete: () => void;
  onboardingData: OnboardingStatusResponse;
};

export default function Step7Complete({ onComplete }: Props) {
  const { t } = useTranslation("onboarding");

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 3, fontWeight: "100" }}
      >
        {t("step7.title")}
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 4, color: "text.secondary", fontWeight: "100" }}
      >
        {t("step7.subtitle")}
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ mb: 2, fontWeight: "100" }}
        >
          {t("step7.referralTitle")}
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 3, color: "text.secondary", fontWeight: "100" }}
        >
          {t("step7.referralDescription")}
        </Typography>
        <ReferralStats />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" size="large" onClick={onComplete}>
          {t("step7.goToHome")}
        </Button>
      </Box>
    </Box>
  );
}
