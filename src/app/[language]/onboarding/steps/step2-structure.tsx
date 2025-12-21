"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { useUpdateGroupService } from "@/services/api/services/groups";
import { useSnackbar } from "notistack";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import type { OnboardingStatusResponse } from "@/services/api/services/onboarding";

type Props = {
  onComplete: () => void;
  onboardingData: OnboardingStatusResponse;
};

export default function Step2Structure({ onComplete, onboardingData }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const updateGroup = useUpdateGroupService();
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  // Local state to track the personal group name
  const [personalGroupName, setPersonalGroupName] = useState(
    onboardingData.personalGroup?.name || ""
  );

  const hasInvitedGroup = !!onboardingData.invitedGroup;
  const personalGroup = onboardingData.personalGroup;

  const handleRename = async () => {
    if (!personalGroup || !newName.trim()) return;

    try {
      const trimmedName = newName.trim();
      console.log("Renaming group:", personalGroup.id, "to:", trimmedName);
      const response = await updateGroup(personalGroup.id, {
        name: trimmedName,
      });
      console.log("Update response:", response);

      if (response.status === HTTP_CODES_ENUM.OK) {
        // Update local state with the new name - use response.data.name if available, otherwise use the trimmed input
        const updatedName = response.data?.name || trimmedName;
        console.log("Updating personalGroupName to:", updatedName);
        setPersonalGroupName(updatedName);
        enqueueSnackbar("Grupo renomeado com sucesso", { variant: "success" });
        setRenaming(false);
        setNewName("");
      } else {
        console.error("Unexpected response status:", response.status);
        enqueueSnackbar("Erro ao renomear grupo", { variant: "error" });
      }
    } catch (error) {
      console.error("Error renaming group:", error);
      enqueueSnackbar("Erro ao renomear grupo", { variant: "error" });
    }
  };

  if (hasInvitedGroup && onboardingData.invitedGroup) {
    // Variante B - Usuário veio por convite
    const invitedGroup = onboardingData.invitedGroup;
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Você entrou no grupo {invitedGroup.name}
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
          Além dele, você também tem um grupo pessoal para coisas privadas.
        </Typography>

        <Stack spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Grupo ativo:
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body1" fontWeight="medium">
                {invitedGroup.name}
              </Typography>
              <Chip label="ativo" size="small" color="primary" />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Grupo pessoal:
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {renaming ? (
                <>
                  <TextField
                    size="small"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={personalGroup?.name}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <Button size="small" onClick={handleRename}>
                    Salvar
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setRenaming(false);
                      setNewName("");
                    }}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="body1">
                    {personalGroupName || personalGroup?.name}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setRenaming(true);
                      setNewName(
                        personalGroupName || personalGroup?.name || ""
                      );
                    }}
                  >
                    Renomear
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Stack>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={onComplete}>
            Ver meu grupo
          </Button>
          <Button variant="contained" onClick={onComplete}>
            Continuar no grupo {invitedGroup.name}
          </Button>
        </Box>
      </Box>
    );
  } else {
    // Variante A - Usuário NÃO veio por convite
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Pronto. Seu espaço já está criado.
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
          Já deixamos um grupo pronto pra você começar agora.
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Seu grupo:
          </Typography>
          {renaming ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <TextField
                size="small"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={personalGroup?.name}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <Button size="small" onClick={handleRename}>
                Salvar
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setRenaming(false);
                  setNewName("");
                }}
              >
                Cancelar
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body1">
                {personalGroupName || personalGroup?.name}
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  setRenaming(true);
                  setNewName(personalGroupName || personalGroup?.name || "");
                }}
              >
                Renomear
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" size="large" onClick={onComplete}>
            Continuar
          </Button>
        </Box>
      </Box>
    );
  }
}
