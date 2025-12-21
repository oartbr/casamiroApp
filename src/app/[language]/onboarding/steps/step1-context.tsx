"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import type { OnboardingStatusResponse } from "@/services/api/services/onboarding";

type Props = {
  onComplete: (context: string) => void;
  onboardingData: OnboardingStatusResponse;
};

const contextOptions = [
  {
    id: "casa",
    emoji: "🏠",
    label: "Casa / Família",
    description: "compras do dia a dia",
  },
  {
    id: "casal",
    emoji: "💑",
    label: "Casal",
    description: "dividir tarefas e gastos",
  },
  {
    id: "republica",
    emoji: "🧑‍🤝‍🧑",
    label: "República / amigos",
    description: "listas e compras coletivas",
  },
  {
    id: "escritorio",
    emoji: "🏢",
    label: "Escritório",
    description: "itens do time",
  },
  {
    id: "condominio",
    emoji: "🏘️",
    label: "Condomínio",
    description: "gastos e necessidades",
  },
];

export default function Step1Context({ onComplete }: Props) {
  const [selectedContext, setSelectedContext] = useState<string | null>(null);

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
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Bem-vindo ao Casamiro
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
        Como você vai usar o app?
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {contextOptions.map((option) => (
          <Grid item xs={12} sm={6} key={option.id}>
            <Card
              sx={{
                cursor: "pointer",
                border: selectedContext === option.id ? 2 : 1,
                borderColor:
                  selectedContext === option.id ? "primary.main" : "divider",
                "&:hover": {
                  borderColor: "primary.main",
                  borderWidth: 2,
                },
                transition: "all 0.2s",
              }}
              onClick={() => handleSelect(option.id)}
            >
              <CardContent>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  {option.emoji}
                </Typography>
                <Typography variant="h6" component="h3" gutterBottom>
                  {option.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
          Continuar
        </Button>
      </Box>
    </Box>
  );
}
