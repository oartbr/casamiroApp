"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import {
  useGetListItemsQuery,
  useCreateListItemMutation,
} from "@/services/api/react-query/lists-queries";
import useAuth from "@/services/auth/use-auth";
import { useSnackbar } from "notistack";
import { useTranslation } from "@/services/i18n/client";
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
  const { t } = useTranslation("onboarding");
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const createListItemMutation = useCreateListItemMutation();
  const [items, setItems] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState("");

  const defaultList = onboardingData.defaultList;
  const hasExistingItems = (onboardingData.defaultList?.itemCount || 0) > 0;

  // Fetch existing list items
  const { data: listItemsData } = useGetListItemsQuery(
    defaultList?.id || "",
    !!defaultList?.id
  );

  const existingItems = listItemsData?.results || [];

  const handleAddItem = async (itemName: string) => {
    if (!itemName.trim() || !defaultList || !user?.id) return;

    try {
      await createListItemMutation.mutateAsync({
        listId: defaultList.id,
        text: itemName.trim(),
      });
      setItems([...items, itemName.trim()]);
      setCurrentItem("");
      enqueueSnackbar(t("step4.addSuccess"), { variant: "success" });
      // The mutation automatically invalidates the query cache,
      // so existingItems will be refreshed automatically
    } catch (error) {
      console.error("Error adding item:", error);
      enqueueSnackbar(t("step4.addError"), { variant: "error" });
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

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 3, fontWeight: "100" }}
      >
        {hasExistingItems
          ? t("step4.titleWithItems")
          : t("step4.titleWithoutItems")}
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 4, color: "text.secondary", fontWeight: "100" }}
      >
        {hasExistingItems
          ? t("step4.subtitleWithItems")
          : t("step4.subtitleWithoutItems")}
      </Typography>

      {/* Show existing items from the list */}
      {existingItems.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: "100" }}
          >
            {t("step4.currentItems")}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {existingItems.map((item) => (
              <Chip
                key={item.id}
                label={item.text}
                variant="outlined"
                color="primary"
              />
            ))}
          </Stack>
        </Box>
      )}

      {!hasExistingItems && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: "100" }}
          >
            {t("step4.suggestions")}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {suggestedItems.map((item) => (
              <Chip
                key={item}
                label={item}
                onClick={() => handleAddSuggested(item)}
                disabled={
                  items.includes(item) ||
                  createListItemMutation.isPending ||
                  existingItems.some(
                    (existing) =>
                      existing.text.toLowerCase() === item.toLowerCase()
                  )
                }
                variant={
                  items.includes(item) ||
                  existingItems.some(
                    (existing) =>
                      existing.text.toLowerCase() === item.toLowerCase()
                  )
                    ? "filled"
                    : "outlined"
                }
              />
            ))}
          </Stack>
        </Box>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mb: 3, fontWeight: "100" }}
      >
        <TextField
          fullWidth
          value={currentItem}
          onChange={(e) => setCurrentItem(e.target.value)}
          placeholder={t("step4.placeholder")}
          disabled={createListItemMutation.isPending}
          sx={{ mb: 2, fontWeight: "100" }}
        />
        <Button
          type="submit"
          variant="outlined"
          disabled={!currentItem.trim() || createListItemMutation.isPending}
          fullWidth
        >
          {t("step4.add")}
        </Button>
      </Box>

      {items.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t("step4.itemsAdded")}
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
          {t("step4.continue")}
        </Button>
      </Box>
    </Box>
  );
}
