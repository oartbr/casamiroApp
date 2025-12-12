"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useReferralRankingsService } from "@/services/api/services/referral";
import { useTranslation } from "@/services/i18n/client";
import type {
  ReferralRanking,
  ReferralRankingsResponse,
} from "@/services/api/services/referral";

type Period = "week" | "month" | "all";

export function ReferralRankings() {
  const { t } = useTranslation("referral");
  const fetchReferralRankings = useReferralRankingsService();
  const [period, setPeriod] = useState<Period>("week");
  const [rankings, setRankings] = useState<ReferralRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRankings = async () => {
      setLoading(true);
      try {
        const { data } = await fetchReferralRankings(period, 10);
        if (data) {
          setRankings(
            (data as ReferralRankingsResponse).rankings ||
              ([] as ReferralRanking[])
          );
        }
      } catch (error) {
        console.error("Failed to load referral rankings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRankings();
  }, [period, fetchReferralRankings]);

  const handlePeriodChange = (
    _event: React.SyntheticEvent,
    newValue: Period
  ) => {
    setPeriod(newValue);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t("referral:rankingsTitle")}
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={period} onChange={handlePeriodChange}>
            <Tab label={t("referral:thisWeek")} value="week" />
            <Tab label={t("referral:thisMonth")} value="month" />
            <Tab label={t("referral:allTime")} value="all" />
          </Tabs>
        </Box>

        {loading ? (
          <Typography>{t("referral:loading")}</Typography>
        ) : rankings.length === 0 ? (
          <Typography color="text.secondary">
            {t("referral:noRankings")}
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("referral:rank")}</TableCell>
                  <TableCell>{t("referral:name")}</TableCell>
                  <TableCell>{t("referral:referralCode")}</TableCell>
                  <TableCell align="right">{t("referral:referrals")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankings.map((ranking) => (
                  <TableRow key={ranking.userId}>
                    <TableCell>
                      <Typography variant="h6" color="primary">
                        #{ranking.rank}
                      </Typography>
                    </TableCell>
                    <TableCell>{ranking.firstName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {ranking.referralCode}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">
                        {ranking.referralCount}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
