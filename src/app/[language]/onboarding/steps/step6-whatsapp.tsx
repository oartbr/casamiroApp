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
import type { OnboardingStatusResponse } from "@/services/api/services/onboarding";

type Props = {
  onComplete: () => void;
  onboardingData: OnboardingStatusResponse;
};

const examples = [
  "adicionar café na lista da Casa",
  "o que está faltando?",
  "marcar comprado: leite",
];

export default function Step6WhatsApp({ onComplete }: Props) {
  const handleOpenWhatsApp = () => {
    // This would open WhatsApp Web or the app
    // For now, we'll just show a message
    window.open("https://web.whatsapp.com", "_blank");
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Use como você já usa o WhatsApp
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Exemplos:
            </Typography>
            <List dense>
              {examples.map((example, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemText primary={example} />
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
          Abrir WhatsApp
        </Button>

        <Button variant="text" size="medium" onClick={onComplete}>
          Agora não
        </Button>
      </Box>
    </Box>
  );
}
