"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import AddIcon from "@mui/icons-material/Add";
import { useCreateListItemMutation } from "../../services/api/react-query/lists-queries";
import { useSnackbar } from "notistack";

interface ItemInputProps {
  listId: string;
  onItemAdded?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ItemInput({
  listId,
  onItemAdded,
  disabled = false,
  placeholder = "Add an item to the list...",
}: ItemInputProps) {
  const [itemText, setItemText] = useState("");
  const createItemMutation = useCreateListItemMutation();
  const { enqueueSnackbar } = useSnackbar();

  const handleAddItem = async () => {
    if (!itemText.trim()) {
      enqueueSnackbar("Please enter an item", { variant: "error" });
      return;
    }

    try {
      await createItemMutation.mutateAsync({
        text: itemText.trim(),
        listId,
      });

      setItemText("");
      onItemAdded?.();
      enqueueSnackbar("Item added successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to add item", { variant: "error" });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAddItem();
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        placeholder={placeholder}
        value={itemText}
        onChange={(e) => setItemText(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled || createItemMutation.isPending}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleAddItem}
                disabled={
                  disabled || createItemMutation.isPending || !itemText.trim()
                }
                color="primary"
                edge="end"
              >
                <AddIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        helperText="Press Enter to add item"
      />
    </Box>
  );
}
