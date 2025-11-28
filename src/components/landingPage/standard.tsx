"use client";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { useTranslation } from "@/services/i18n/client";
import { Trans } from "react-i18next/TransWithoutContext";
import scan from "../../../public/assets/images/home.png";

export function StandardLandingPage() {
  const { t: home } = useTranslation("home");

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} pt={3} direction="row">
        <Grid item xs={12} md={6}>
          <div className="mensagem">
            <Typography variant="h4" gutterBottom>
              {home("title")}
            </Typography>
            <Typography variant="body1" paragraph>
              <Trans
                i18nKey="description"
                t={home}
                components={[
                  <MuiLink
                    key="1"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://xpand.international"
                  >
                    {}
                  </MuiLink>,
                ]}
              />
            </Typography>
            <Button
              variant="contained"
              LinkComponent={Link}
              href="/sign-up"
              data-testid="sign-up"
              className="joinButton"
              sx={{ mb: 2 }}
            >
              {home("callToAction")}
            </Button>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {home("socialProof")}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            component="div"
            className="scan"
            sx={{ position: "relative", height: "400px" }}
          >
            <div className="scanning">
              <Image
                className="qrScan"
                src={scan.src}
                alt="scan"
                fill={true}
                style={{ objectFit: "contain" }}
              />
            </div>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
