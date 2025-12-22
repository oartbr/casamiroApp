"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/services/auth/use-auth";
import {
  useGetOnboardingStatusService,
  useUpdateOnboardingContextService,
  useCompleteOnboardingService,
} from "@/services/api/services/onboarding";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useSnackbar } from "notistack";
import { useTranslation } from "@/services/i18n/client";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import type { OnboardingStatusResponse } from "@/services/api/services/onboarding";

// Import step components
import Step1Context from "./steps/step1-context";
import Step2Structure from "./steps/step2-structure";
import Step3Invite from "./steps/step3-invite";
import Step4FirstAction from "./steps/step4-first-action";
import Step5Nota from "./steps/step5-nota";
import Step6WhatsApp from "./steps/step6-whatsapp";
import Step7Complete from "./steps/step7-complete";

type Props = {
  params: { language: string };
};

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function OnboardingPageContent({ params }: Props) {
  const { t } = useTranslation("onboarding");
  const router = useRouter();
  const { user, isLoaded } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [onboardingData, setOnboardingData] =
    useState<OnboardingStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOnboardingStatus = useGetOnboardingStatusService();
  const updateContext = useUpdateOnboardingContextService();
  const completeOnboarding = useCompleteOnboardingService();

  useEffect(() => {
    const loadOnboardingStatus = async () => {
      console.log("loadOnboardingStatus called", { isLoaded, user });

      // Wait for auth to load
      if (!isLoaded) {
        console.log("Auth not loaded yet, waiting...");
        return;
      }

      // Use user from AuthContext
      const currentUser = user;
      console.log("Current user:", currentUser);

      if (!currentUser?.id) {
        console.log(
          "User not available after auth loaded, redirecting to home"
        );
        router.replace("/");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching onboarding status for user:", currentUser.id);
        const response = await fetchOnboardingStatus({
          userId: String(currentUser.id),
        });
        console.log("Onboarding status response:", response);

        console.log("Response status:", response.status);
        console.log("Response data:", response.data);

        if (response.status === HTTP_CODES_ENUM.OK) {
          if (response.data) {
            console.log("Onboarding data received:", response.data);
            setOnboardingData(response.data);

            // If onboarding is already completed, redirect to home
            if (response.data.onboardingCompleted) {
              console.log("Onboarding already completed, redirecting to home");
              router.replace("/");
              setLoading(false);
              return;
            }

            // Determine starting step based on progress
            if (!response.data.onboardingContext) {
              console.log("No context set, starting at step 1");
              setCurrentStep(1);
            } else {
              console.log("Context exists, starting at step 2");
              // Continue from where they left off
              setCurrentStep(2);
            }
          } else {
            console.error("Response OK but no data received:", response);
            enqueueSnackbar(t("common.error.noData"), { variant: "error" });
          }
        } else {
          console.error(
            "Unexpected response status:",
            response.status,
            response
          );
          enqueueSnackbar(
            t("common.error.loadOnboardingStatus", { status: response.status }),
            { variant: "error" }
          );
        }
      } catch (error) {
        console.error("Error loading onboarding status:", error);
        enqueueSnackbar(t("common.error.loadOnboarding"), { variant: "error" });
        router.replace("/");
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };

    loadOnboardingStatus();
  }, [isLoaded, user, router, fetchOnboardingStatus, enqueueSnackbar, t]);

  const handleStep1Complete = async (context: string) => {
    if (!user?.id) return;

    try {
      await updateContext({
        userId: String(user.id),
        context: context as
          | "casa"
          | "casal"
          | "republica"
          | "escritorio"
          | "condominio",
      });
      setOnboardingData((prev) =>
        prev
          ? {
              ...prev,
              onboardingContext: context,
            }
          : null
      );
      setCurrentStep(2);
    } catch (error) {
      enqueueSnackbar(t("common.error.saveContext"), { variant: "error" });
    }
  };

  const handleStep2Complete = () => {
    setCurrentStep(3);
  };

  const handleStep3Complete = () => {
    setCurrentStep(4);
  };

  const handleStep4Complete = () => {
    setCurrentStep(5);
  };

  const handleStep5Complete = () => {
    setCurrentStep(6);
  };

  const handleStep6Complete = () => {
    setCurrentStep(7);
  };

  const handleStep7Complete = async () => {
    if (!user?.id) return;

    try {
      await completeOnboarding({ userId: String(user.id) });
      router.replace("/");
    } catch (error) {
      enqueueSnackbar(t("common.error.complete"), { variant: "error" });
    }
  };

  console.log("Render state:", {
    loading,
    currentStep,
    onboardingData,
    user,
    isLoaded,
  });

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography>{t("common.loading")}</Typography>
        </Box>
      </Container>
    );
  }

  if (!onboardingData) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography>{t("common.error.loadData")}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        {currentStep === 1 && (
          <Step1Context
            onComplete={handleStep1Complete}
            onboardingData={onboardingData}
          />
        )}
        {currentStep === 2 && (
          <Step2Structure
            onComplete={handleStep2Complete}
            onboardingData={onboardingData}
          />
        )}
        {currentStep === 3 && (
          <Step3Invite
            onComplete={handleStep3Complete}
            onboardingData={onboardingData}
          />
        )}
        {currentStep === 4 && (
          <Step4FirstAction
            onComplete={handleStep4Complete}
            onboardingData={onboardingData}
          />
        )}
        {currentStep === 5 && (
          <Step6WhatsApp
            onComplete={handleStep5Complete}
            onboardingData={onboardingData}
          />
        )}
        {currentStep === 6 && (
          <Step5Nota
            onComplete={handleStep6Complete}
            onboardingData={onboardingData}
          />
        )}
        {currentStep === 7 && (
          <Step7Complete
            onComplete={handleStep7Complete}
            onboardingData={onboardingData}
          />
        )}
        {!onboardingData && (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography>{t("common.noStepAvailable")}</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}
