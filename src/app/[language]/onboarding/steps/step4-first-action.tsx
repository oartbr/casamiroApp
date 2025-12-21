"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { useCreateListItemService } from "@/services/api/services/lists";
import useAuth from "@/services/auth/use-auth";
import { useSnackbar } from "notistack";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import type { OnboardingStatusResponse } from "@/services/api/services/onboarding";

type Props = {
  onComplete: () => void;
  onboardingData: OnboardingStatusResponse;
};

const suggestedItems = ["leite", "pão", "frutas", "arroz", "detergente"];

export default function Step4FirstAction({
  onComplete,
  onboardingData,
}: Props) {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const createListItem = useCreateListItemService();
  const [items, setItems] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultList = onboardingData.defaultList;
  const hasExistingItems = (onboardingData.defaultList?.itemCount || 0) > 0;

  const handleAddItem = async (itemName: string) => {
    if (!itemName.trim() || !defaultList || !user?.id) return;

    setLoading(true);
    try {
      console.log("Adding item:", {
        listId: defaultList.id,
        text: itemName.trim(),
      });
      const response = await createListItem({
        listId: defaultList.id,
        text: itemName.trim(),
      });
      console.log("Create item response:", response);

      if (response.status === HTTP_CODES_ENUM.CREATED) {
        setItems([...items, itemName.trim()]);
        setCurrentItem("");
        enqueueSnackbar("Item adicionado", { variant: "success" });
      } else {
        console.error("Unexpected response status:", response.status);
        enqueueSnackbar(`Erro ao adicionar item (status: ${response.status})`, {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error adding item:", error);
      console.error(
        "Error details:",
        error instanceof Error ? error.message : String(error)
      );
      enqueueSnackbar("Erro ao adicionar item", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuggested = (item: string) => {
    if (!items.includes(item)) {
      handleAddItem(item);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentItem.trim()) {
      handleAddItem(currentItem);
    }
  };

  // Se já tem itens existentes, pode continuar mesmo sem adicionar novos
  // Se não tem itens existentes, precisa adicionar pelo menos 1 item
  const canContinue = hasExistingItems || items.length >= 1;

  // Debug log
  console.log("Step4 - canContinue check:", {
    hasExistingItems,
    itemsLength: items.length,
    canContinue,
    items,
  });

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        {hasExistingItems
          ? "Quer adicionar mais 1–3 itens?"
          : "Qual é a próxima compra ou necessidade desse grupo?"}
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
        {hasExistingItems
          ? "Adicione mais alguns itens à lista."
          : "Não precisa ser perfeito. Adicione pelo menos 1 item e pronto."}
      </Typography>

      {!hasExistingItems && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Sugestões:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {suggestedItems.map((item) => (
              <Chip
                key={item}
                label={item}
                onClick={() => handleAddSuggested(item)}
                disabled={items.includes(item) || loading}
                variant={items.includes(item) ? "filled" : "outlined"}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          value={currentItem}
          onChange={(e) => setCurrentItem(e.target.value)}
          placeholder="Digite um item..."
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="outlined"
          disabled={!currentItem.trim() || loading}
          fullWidth
        >
          Adicionar
        </Button>
      </Box>

      {items.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Itens adicionados:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {items.map((item, index) => (
              <Chip
                key={index}
                label={item}
                onDelete={() => setItems(items.filter((_, i) => i !== index))}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="large"
          onClick={onComplete}
          disabled={!canContinue}
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );
}
