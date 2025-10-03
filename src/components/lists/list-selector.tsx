"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import { List } from "../../services/api/types/list";
import { useCreateListMutation } from "../../services/api/react-query/lists-queries";
import { useSnackbar } from "notistack";

interface ListSelectorProps {
  lists: List[];
  selectedListId: string | null;
  onListChange: (listId: string | null) => void;
  groupId: string;
  disabled?: boolean;
}

export default function ListSelector({
  lists,
  selectedListId,
  onListChange,
  groupId,
  disabled = false,
}: ListSelectorProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const createListMutation = useCreateListMutation();
  const { enqueueSnackbar } = useSnackbar();

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      enqueueSnackbar("List name is required", { variant: "error" });
      return;
    }

    try {
      const newList = await createListMutation.mutateAsync({
        name: newListName.trim(),
        description: newListDescription.trim() || undefined,
        groupId,
        isDefault: false,
      });

      setNewListName("");
      setNewListDescription("");
      setIsCreateDialogOpen(false);
      onListChange(newList.id);
      enqueueSnackbar("List created successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to create list", { variant: "error" });
    }
  };

  const handleCancelCreate = () => {
    setNewListName("");
    setNewListDescription("");
    setIsCreateDialogOpen(false);
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={1}>
        <FormControl fullWidth disabled={disabled}>
          <InputLabel>Select List</InputLabel>
          <Select
            value={selectedListId || ""}
            label="Select List"
            onChange={(e) => onListChange(e.target.value || null)}
          >
            {lists.map((list) => (
              <MenuItem key={list.id} value={list.id}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">
                    {list.name}
                    {list.isDefault && " (Default)"}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={disabled}
          color="primary"
          size="large"
        >
          <AddIcon />
        </IconButton>
      </Box>

      <Dialog
        open={isCreateDialogOpen}
        onClose={handleCancelCreate}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            fullWidth
            variant="outlined"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newListDescription}
            onChange={(e) => setNewListDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCreate}>Cancel</Button>
          <Button
            onClick={handleCreateList}
            variant="contained"
            disabled={createListMutation.isPending || !newListName.trim()}
          >
            {createListMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
