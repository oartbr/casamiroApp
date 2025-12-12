"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useReferralStatsService } from "@/services/api/services/referral";
import { useTranslation } from "@/services/i18n/client";
import { useSnackbar } from "notistack";
import { ShareReferralButton } from "./share-referral-button";

export function ReferralStats() {
  const { t } = useTranslation("referral");
  const { enqueueSnackbar } = useSnackbar();
  const fetchReferralStats = useReferralStatsService();
  const [stats, setStats] = useState<{
    referralCode: string;
    totalReferrals: number;
    weeklyReferrals: number;
    monthlyReferrals: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchReferralStats();
        if (response.data && "referralCode" in response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Failed to load referral stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [fetchReferralStats]);

  const getReferralLink = () => {
    if (typeof window === "undefined" || !stats?.referralCode) return "";
    const baseUrl = window.location.origin;
    // Use the new /indique/[id] format
    return `${baseUrl}/indique/${stats.referralCode}`;
  };

  const handleCopyLink = async () => {
    const link = getReferralLink();
    if (link) {
      try {
        await navigator.clipboard.writeText(link);
        enqueueSnackbar(t("referral:linkCopied"), { variant: "success" });
      } catch (error) {
        enqueueSnackbar(t("referral:copyFailed"), { variant: "error" });
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>{t("referral:loading")}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Grid item xs={12} md={6}>
          <h1 style={{ margin: 0, textAlign: "left" }}>
            {t("referral:title")}
          </h1>
        </Grid>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t("referral:description")}
        </Typography>

        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            {t("referral:yourCode")}
          </Typography>
          <Typography variant="h4" color="primary" gutterBottom>
            {stats.referralCode}
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            <ShareReferralButton referralCode={stats.referralCode} />
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLink}
            >
              {t("referral:copy")}
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary">
                {stats.weeklyReferrals}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("referral:weeklyReferrals")}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary">
                {stats.monthlyReferrals}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("referral:monthlyReferrals")}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary">
                {stats.totalReferrals}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("referral:totalReferrals")}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
