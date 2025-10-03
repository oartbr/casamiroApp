"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Chip from "@mui/material/Chip";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { ListItem as ListItemType } from "../../services/api/types/list";
import {
  useDeleteListItemMutation,
  useUpdateListItemMutation,
} from "../../services/api/react-query/lists-queries";
import { useSnackbar } from "notistack";

interface ItemDisplayProps {
  item: ListItemType;
  listId: string;
  onItemDeleted?: () => void;
  onItemUpdated?: () => void;
  disabled?: boolean;
}

export default function ItemDisplay({
  item,
  listId,
  onItemDeleted,
  onItemUpdated,
  disabled = false,
}: ItemDisplayProps) {
  const deleteItemMutation = useDeleteListItemMutation();
  const updateItemMutation = useUpdateListItemMutation();
  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteItem = async () => {
    try {
      await deleteItemMutation.mutateAsync({
        itemId: item.id,
        listId: listId,
      });
      onItemDeleted?.();
      enqueueSnackbar("Item deleted successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to delete item", { variant: "error" });
    }
  };

  const handleToggleComplete = async () => {
    try {
      await updateItemMutation.mutateAsync({
        itemId: item.id,
        data: {
          isCompleted: !item.isCompleted,
        },
      });
      onItemUpdated?.();
      enqueueSnackbar(
        item.isCompleted
          ? "Item marked as incomplete"
          : "Item marked as complete",
        { variant: "success" }
      );
    } catch (error) {
      enqueueSnackbar("Failed to update item", { variant: "error" });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getTooltipText = () => {
    const adderName = item.addedBy || "Unknown user";
    const addedDate = formatDate(item.createdAt);

    if (item.isCompleted && item.completedBy && item.completedAt) {
      const completerName = item.completedBy
        ? `${item.completedBy.firstName} ${item.completedBy.lastName}`
        : "Unknown user";
      const completedDate = formatDate(item.completedAt);

      return `Added by ${adderName} on ${addedDate}\nCompleted by ${completerName} on ${completedDate}`;
    }

    return `Added by ${adderName} on ${addedDate}`;
  };

  return (
    <ListItem
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        mb: 1,
        bgcolor: item.isCompleted ? "action.hover" : "background.paper",
        opacity: item.isCompleted ? 0.7 : 1,
      }}
    >
      <ListItemText
        primary={
          <Tooltip title={getTooltipText()} arrow placement="top">
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="body1"
                sx={{
                  textDecoration: item.isCompleted ? "line-through" : "none",
                  color: item.isCompleted ? "text.secondary" : "text.primary",
                }}
              >
                {item.text}
              </Typography>
              {item.isCompleted && (
                <Chip
                  label="Completed"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
          </Tooltip>
        }
        secondary={
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            {item.isCompleted && item.completedAt && (
              <>
                <Typography variant="caption" color="text.secondary">
                  • Completed {formatDate(item.completedAt)}
                </Typography>
              </>
            )}
          </Box>
        }
      />
      <ListItemSecondaryAction>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Tooltip
            title={item.isCompleted ? "Mark as incomplete" : "Mark as complete"}
          >
            <IconButton
              onClick={handleToggleComplete}
              disabled={disabled || updateItemMutation.isPending}
              color={item.isCompleted ? "success" : "default"}
              size="small"
            >
              {item.isCompleted ? (
                <CheckCircleIcon />
              ) : (
                <RadioButtonUncheckedIcon />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete item">
            <IconButton
              onClick={handleDeleteItem}
              disabled={disabled || deleteItemMutation.isPending}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </ListItemSecondaryAction>
    </ListItem>
  );
}
