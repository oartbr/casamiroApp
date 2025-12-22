"use client";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { useTranslation } from "@/services/i18n/client";
import type { OnboardingStatusResponse } from "@/services/api/services/onboarding";

type Props = {
  onComplete: () => void;
  onboardingData: OnboardingStatusResponse;
};

export default function Step6WhatsApp({ onComplete }: Props) {
  const { t } = useTranslation("onboarding");

  const examples = [
    t("step5.example1"),
    t("step5.example2"),
    t("step5.example3"),
  ];

  const handleOpenWhatsApp = () => {
    // This would open WhatsApp Web or the app
    // For now, we'll just show a message
    window.open("https://web.whatsapp.com", "_blank");
  };

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 3, fontWeight: "100" }}
      >
        {t("step5.title")}
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 4, color: "text.secondary", fontWeight: "100" }}
      >
        {t("step5.subtitle")}
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ fontWeight: "100" }}
            >
              {t("step5.examples")}
            </Typography>
            <List dense>
              {examples.map((example, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemText
                      primary={example}
                      sx={{ fontWeight: "100" }}
                    />
                  </ListItem>
                  {index < examples.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleOpenWhatsApp}
          fullWidth
        >
          {t("step5.openWhatsApp")}
        </Button>

        <Button variant="text" size="medium" onClick={onComplete}>
          {t("step5.notNow")}
        </Button>
      </Box>
    </Box>
  );
}
