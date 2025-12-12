"use client";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
//import Typography from "@mui/material/Typography";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { ReferralStats } from "@/components/referral/referral-stats";
import { ReferralRankings } from "@/components/referral/referral-rankings";
// import { useTranslation } from "@/services/i18n/client";

function Referrals() {
  return (
    <Container maxWidth="lg" className="mainContainer">
      <Grid
        container
        spacing={3}
        pt={3}
        direction="column"
        sx={{ alignItems: "start" }}
      ></Grid>
      <Grid container spacing={3} pt={3}>
        <Grid item xs={12} md={6}>
          <ReferralStats />
        </Grid>
        <Grid item xs={12} md={6}>
          <ReferralRankings />
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(Referrals);
