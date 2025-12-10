/* eslint-disable no-restricted-syntax */
"use client";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { useTranslation } from "@/services/i18n/client";
import heroImage from "../../../public/assets/images/hero1.png";
import hexa1Image from "../../../public/hexaAll.png";
import familia from "../../../public/familia.png";

export function StandardLandingPage() {
  const { t } = useTranslation("landingStandard");
  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} pt={3} direction="row">
        <Grid item xs={12} md={6}>
          <div className="mensagem">
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "light" }}>
              {t("hero.title")}
            </Typography>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: "light", width: "80%" }}
            >
              {t("hero.subtitle")}
            </Typography>
            <Button
              variant="contained"
              LinkComponent={Link}
              href="/sign-up"
              data-testid="sign-up"
              className="joinButton"
              sx={{ mb: 2 }}
            >
              {t("hero.button")}
            </Button>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("hero.socialProof")}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box component="div" className="scan" sx={{ position: "relative" }}>
            <div className="scanning">
              <Image
                className="qrScan"
                src={heroImage.src}
                alt={t("images.heroAlt")}
                fill={true}
                style={{ objectFit: "contain" }}
              />
            </div>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" flexDirection="row" gap={2}>
            <Box display="flex" flexDirection="row" gap={4}>
              <Image
                src={hexa1Image.src}
                alt={t("images.easyAndPracticalAlt")}
                width={300}
                height={100}
                className="beneficios"
              />
            </Box>
            <Typography variant="body1" paragraph className="featureList">
              <Box
                component="ul"
                sx={{ listStyle: "none", pl: 0, mb: 2, fontWeight: "light" }}
              >
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ fontWeight: "light" }}
                >
                  {t("easyAndPractical.title")}
                </Typography>
                <Box component="li" display="flex" alignItems="center" mb={1}>
                  <Typography
                    variant="body1"
                    component="span"
                    mr={1}
                    color="primary"
                  >
                    ✓
                  </Typography>
                  <Typography variant="body1" component="span">
                    {t("easyAndPractical.features.readReceipts")}
                  </Typography>
                </Box>
                <Box component="li" display="flex" alignItems="center" mb={1}>
                  <Typography
                    variant="body1"
                    component="span"
                    mr={1}
                    color="primary"
                  >
                    ✓
                  </Typography>
                  <Typography variant="body1" component="span">
                    {t("easyAndPractical.features.organizeLists")}
                  </Typography>
                </Box>
                <Box component="li" display="flex" alignItems="center" mb={1}>
                  <Typography
                    variant="body1"
                    component="span"
                    mr={1}
                    color="primary"
                  >
                    ✓
                  </Typography>
                  <Typography variant="body1" component="span">
                    {t("easyAndPractical.features.enjoyOffers")}
                  </Typography>
                </Box>
                <Box component="li" display="flex" alignItems="center" mb={1}>
                  <Typography
                    variant="body1"
                    component="span"
                    mr={1}
                    color="primary"
                  >
                    ✓
                  </Typography>
                  <Typography variant="body1" component="span">
                    {t("easyAndPractical.features.organizeFamily")}
                  </Typography>
                </Box>
                <Box component="li" display="flex" alignItems="center">
                  <Typography
                    variant="body1"
                    component="span"
                    mr={1}
                    color="primary"
                  >
                    ✓
                  </Typography>
                  <Typography variant="body1" component="span">
                    {t("easyAndPractical.features.financialTranquility")}
                  </Typography>
                </Box>
              </Box>
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row" gap={4}>
            <Image
              src={hexa1Image.src}
              alt={t("images.easyAndPracticalAlt")}
              width={300}
              height={100}
              className="beneficiosB"
            />
          </Box>
        </Grid>

        <Grid item xs={12} className="beneficiosContainer">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "light" }}>
            {t("benefits.title")}
          </Typography>
          <Typography variant="body1" paragraph className="featureList">
            <Box
              component="ul"
              sx={{ listStyle: "none", pl: 0, mb: 2, fontWeight: "light" }}
            >
              <Box
                display="flex"
                flexDirection="column"
                gap={4}
                sx={{
                  position: "absolute",
                  marginTop: "0px",
                }}
                component="div"
              >
                <Image
                  src={familia.src}
                  alt={t("images.familyTimeAlt")}
                  width={300}
                  height={100}
                  className="beneficiosC"
                />
              </Box>
              <Box component="li" display="flex" alignItems="center" mb={1}>
                <Typography variant="body1" component="span">
                  {t("benefits.spendLess")}
                </Typography>
                <Box component="span" mr={1} className="beneficioItem">
                  ✓
                </Box>
              </Box>
              <Box component="li" display="flex" alignItems="center" mb={1}>
                <Typography variant="body1" component="span">
                  {t("benefits.receiveOffers")}
                </Typography>
                <Box component="span" mr={1} className="beneficioItem">
                  ✓
                </Box>
              </Box>
              <Box component="li" display="flex" alignItems="center" mb={1}>
                <Typography variant="body1" component="span">
                  {t("benefits.organizedHome")}
                </Typography>
                <Box component="span" mr={1} className="beneficioItem">
                  ✓
                </Box>
              </Box>
              <Box component="li" display="flex" alignItems="center" mb={1}>
                <Typography variant="body1" component="span">
                  {t("benefits.comparePrices")}
                </Typography>
                <Box component="span" mr={1} className="beneficioItem">
                  ✓
                </Box>
              </Box>
              <Box component="li" display="flex" alignItems="center">
                <Typography variant="body1" component="span">
                  {t("benefits.familyHelping")}
                </Typography>
                <Box component="span" mr={1} className="beneficioItem">
                  ✓
                </Box>
              </Box>
              <Box
                display="flex"
                flexDirection="row"
                gap={4}
                sx={{ alignSelf: "center" }}
              >
                <Image
                  src={familia.src}
                  alt={t("images.familyTimeAlt")}
                  width={300}
                  height={100}
                  className="beneficiosD"
                />
              </Box>
            </Box>
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            className="ctaContainerBottom"
          >
            <Button
              variant="contained"
              LinkComponent={Link}
              href="/sign-up"
              data-testid="sign-up"
              className="joinButton"
              sx={{ mb: 2, alignSelf: "center" }}
            >
              {t("cta.button")}
            </Button>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("cta.socialProof")}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
