"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { useUpdateGroupMutation } from "@/services/api/react-query/groups-queries";
import { useSnackbar } from "notistack";
import { useTranslation } from "@/services/i18n/client";
import type { OnboardingStatusResponse } from "@/services/api/services/onboarding";

type Props = {
  onComplete: () => void;
  onboardingData: OnboardingStatusResponse;
};

export default function Step2Structure({ onComplete, onboardingData }: Props) {
  const { t } = useTranslation("onboarding");
  const { enqueueSnackbar } = useSnackbar();
  const updateGroupMutation = useUpdateGroupMutation();
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
      const updatedGroup = await updateGroupMutation.mutateAsync({
        groupId: personalGroup.id,
        data: {
          name: trimmedName,
        },
      });

      // Update local state with the new name - use response.data.name if available, otherwise use the trimmed input
      const updatedName = updatedGroup?.name || trimmedName;
      setPersonalGroupName(updatedName);
      enqueueSnackbar(t("step2.renameSuccess"), { variant: "success" });
      setRenaming(false);
      setNewName("");
      // The React Query cache is automatically invalidated by useUpdateGroupMutation,
      // which will cause the header's useGroupQuery to refetch and display the updated name
    } catch (error) {
      enqueueSnackbar(t("step2.renameError"), { variant: "error" });
    }
  };

  if (hasInvitedGroup && onboardingData.invitedGroup) {
    // Variante B - Usuário veio por convite
    const invitedGroup = onboardingData.invitedGroup;
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          {t("step2.invited.title", { groupName: invitedGroup.name })}
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
          {t("step2.invited.subtitle")}
        </Typography>

        <Stack spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t("step2.invited.activeGroup")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body1" fontWeight="medium">
                {invitedGroup.name}
              </Typography>
              <Chip
                label={t("step2.invited.active")}
                size="small"
                color="primary"
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t("step2.invited.personalGroup")}
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
                    {t("step2.save")}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setRenaming(false);
                      setNewName("");
                    }}
                  >
                    {t("step2.cancel")}
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="body1">
                    {personalGroupName || personalGroup?.name}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setRenaming(true);
                      setNewName(
                        personalGroupName || personalGroup?.name || ""
                      );
                    }}
                  >
                    {t("step2.rename")}
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Stack>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={onComplete}>
            {t("step2.invited.viewMyGroup")}
          </Button>
          <Button variant="contained" onClick={onComplete}>
            {t("step2.invited.continueInGroup", {
              groupName: invitedGroup.name,
            })}
          </Button>
        </Box>
      </Box>
    );
  } else {
    // Variante A - Usuário NÃO veio por convite
    const currentGroupName = personalGroupName || personalGroup?.name || "";
    return (
      <Box>
        {renaming ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mb: 2,
              mt: 0,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ mb: 0, fontWeight: "100" }}
            >
              {t("step2.notInvited.title")}
            </Typography>
            <TextField
              variant="standard"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={personalGroup?.name}
              color="secondary"
              sx={{
                flex: 1,
                minWidth: 200,
                fontWeight: "100",
                fontSize: "5rem !important",
                ml: 1,
              }}
            />
            <Button size="small" onClick={handleRename}>
              {t("step2.save")}
            </Button>
            <Button
              size="small"
              onClick={() => {
                setRenaming(false);
                setNewName("");
              }}
            >
              {t("step2.cancel")}
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ mb: 3, fontWeight: "100" }}
              >
                {t("step2.notInvited.title")}{" "}
                <span style={{ fontWeight: "400" }}>{currentGroupName}</span>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setRenaming(true);
                  setNewName(personalGroupName || personalGroup?.name || "");
                }}
              >
                {t("step2.rename")}
              </Button>
            </Box>
          </>
        )}

        <Typography
          variant="body1"
          sx={{ mb: 4, color: "text.secondary", fontWeight: "100" }}
        >
          {t("step2.notInvited.subtitle")}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" size="large" onClick={onComplete}>
            {t("step2.notInvited.continue")}
          </Button>
        </Box>
      </Box>
    );
  }
}
