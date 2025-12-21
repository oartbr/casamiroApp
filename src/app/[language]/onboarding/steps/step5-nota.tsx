"use client";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import useLanguage from "@/services/i18n/use-language";
import type { OnboardingStatusResponse } from "@/services/api/services/onboarding";

type Props = {
  onComplete: () => void;
  onboardingData: OnboardingStatusResponse;
};

export default function Step5Nota({ onComplete }: Props) {
  const router = useRouter();
  const language = useLanguage();

  const handleScan = () => {
    router.push(`/${language}/scan`);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Quer deixar o Casamiro mais inteligente?
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
        Com 1 nota fiscal ele entende marcas, preços e frequência — e começa a
        sugerir o que fazer.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button variant="contained" size="large" onClick={handleScan} fullWidth>
          Escanear nota agora
        </Button>

        <Button variant="text" size="medium" onClick={onComplete}>
          Fazer depois
        </Button>
      </Box>
    </Box>
  );
}
