"use client";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import WhatsAppInviteButton from "@/components/groups/whatsapp-invite-button";
import type { OnboardingStatusResponse } from "@/services/api/services/onboarding";

type Props = {
  onComplete: () => void;
  onboardingData: OnboardingStatusResponse;
};

export default function Step3Invite({ onComplete, onboardingData }: Props) {
  const activeGroup = onboardingData.activeGroup;

  if (!activeGroup) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Quem usa junto, decide junto
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
          Erro: grupo não encontrado.
        </Typography>
        <Button variant="text" size="medium" onClick={onComplete}>
          Pular por enquanto
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Quem usa junto, decide junto
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
        Convide agora. Leva 5 segundos e melhora tudo depois.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <WhatsAppInviteButton
          groupId={activeGroup.id}
          groupName={activeGroup.name}
          variant="contained"
          size="large"
          fullWidth
        >
          Convidar pelo WhatsApp
        </WhatsAppInviteButton>

        <Button variant="text" size="medium" onClick={onComplete}>
          Pular por enquanto
        </Button>
      </Box>
    </Box>
  );
}
