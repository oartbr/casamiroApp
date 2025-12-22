"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import { useTranslation } from "@/services/i18n/client";
import type { OnboardingStatusResponse } from "@/services/api/services/onboarding";

type Props = {
  onComplete: (context: string) => void;
  onboardingData: OnboardingStatusResponse;
};

export default function Step1Context({ onComplete }: Props) {
  const { t } = useTranslation("onboarding");
  const [selectedContext, setSelectedContext] = useState<string | null>(null);

  const contextOptions = [
    {
      id: "casa",
      image: "/onboarding/familia.jpg",
      label: t("step1.contexts.casa.label"),
      description: t("step1.contexts.casa.description"),
    },
    {
      id: "casal",
      image: "/onboarding/casal.jpg",
      label: t("step1.contexts.casal.label"),
      description: t("step1.contexts.casal.description"),
    },
    {
      id: "republica",
      image: "/onboarding/amigos.jpg",
      label: t("step1.contexts.republica.label"),
      description: t("step1.contexts.republica.description"),
    },
    {
      id: "escritorio",
      image: "/onboarding/escritorio.jpg",
      label: t("step1.contexts.escritorio.label"),
      description: t("step1.contexts.escritorio.description"),
    },
    {
      id: "condominio",
      image: "/onboarding/condominio.jpg",
      label: t("step1.contexts.condominio.label"),
      description: t("step1.contexts.condominio.description"),
    },
  ];

  const handleSelect = (contextId: string) => {
    setSelectedContext(contextId);
  };

  const handleContinue = () => {
    if (selectedContext) {
      onComplete(selectedContext);
    }
  };

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 3, fontWeight: "100" }}
      >
        {t("step1.title")}
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 4, color: "text.secondary", fontWeight: "100" }}
      >
        {t("step1.subtitle")}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {contextOptions.map((option) => (
          <Grid item xs={12} sm={6} key={option.id}>
            <Card
              sx={{
                cursor: "pointer",
                position: "relative",
                backgroundImage: `url(${option.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: 200,
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  transition: "background-color 0.3s ease",
                },
                "&:hover::before": {
                  backgroundColor: "rgba(0, 0, 0, 0)",
                },
                transition: "all 0.3s ease",
              }}
              onClick={() => handleSelect(option.id)}
            >
              <CardContent
                sx={{
                  position: "relative",
                  zIndex: 1,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  minHeight: 200,
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  sx={{ color: "white" }}
                >
                  {option.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                >
                  {option.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleContinue}
          disabled={!selectedContext}
        >
          {t("step1.continue")}
        </Button>
      </Box>
    </Box>
  );
}
