"use client";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { OnboardingStatusResponse } from "@/services/api/services/onboarding";

type Props = {
  onComplete: () => void;
  onboardingData: OnboardingStatusResponse;
};

export default function Step7Complete({ onComplete }: Props) {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Pronto. O Casamiro cuida do próximo passo.
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
        A partir de agora você vai receber sugestões simples, no momento certo,
        baseadas no que acontece no seu grupo.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" size="large" onClick={onComplete}>
          Ir para a página inicial
        </Button>
      </Box>
    </Box>
  );
}
