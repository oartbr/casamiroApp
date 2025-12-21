"use client";
import Button from "@mui/material/Button";
// import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
// import { useAuthResetPasswordService } from "@/services/api/services/auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import { useCheckCodeService } from "@/services/api/services/garantia";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import { useRouter, useSearchParams } from "next/navigation";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import Link from "@mui/material/Link/Link";
import { setReturningUserCookie } from "@/services/auth/returning-user-cookie";
import { setPhoneNumberCookie } from "@/services/auth/phone-number-cookie";
import { clearReferralCodeCookie } from "@/services/auth/referral-cookie";
// import { useGetOnboardingStatusService } from "@/services/api/services/onboarding";
import { API_URL } from "@/services/api/config";

type RegisterFormData = {
  confirmationCode: string;
};

interface confirmStatus {
  confirmed: boolean;
  message: string;
  code: string;
}

type Props = {
  params: { language: string; id: string; confirmStatus: confirmStatus };
};

const useValidationSchema = () => {
  const { t } = useTranslation("register");

  return yup.object().shape({
    confirmationCode: yup
      .string()
      .matches(/^\d{5}$/, t("register:inputs.code.validation.invalid"))
      .required(t("register:inputs.code.validation.required")),
  });
};

function FormActions() {
  const { t } = useTranslation("register");
  const { isSubmitting } = useFormState();
  //const params = new URLSearchParams(window.location.search);
  return (
    <>
      <Grid container spacing={0} mb={2}>
        <Grid item xs={6} mt={3}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isSubmitting}
            data-testid="confirm-code/"
          >
            {t("register:workflow.get-code.submit")}
          </Button>
        </Grid>
        <Grid item xs={6} mt={4}>
          <Link
            href="check-phone-number"
            style={{ textDecoration: "none" }}
            data-testid="resend-code/"
          >
            {t("register:workflow.get-code.resend")}
          </Link>
        </Grid>
      </Grid>
    </>
  );
}

function Form({ params }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  // delete? const fetchAuthResetPassword = useAuthResetPasswordService();
  const { t } = useTranslation("register");
  const validationSchema = useValidationSchema();
  const router = useRouter();
  const fetchCheckCode = useCheckCodeService();
  const searchParams = useSearchParams();
  const { setTokensInfo } = useAuthTokens();
  const { setUser } = useAuthActions();
  // fetchOnboardingStatus is imported but not used, so we remove it to fix the unused import warning.
  //console.log({ validation: searchParams.get("p") });

  const methods = useForm<RegisterFormData>({
    resolver: yupResolver<RegisterFormData>(validationSchema),
    defaultValues: {
      confirmationCode: "",
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const phoneNumber = searchParams.get("p");
    const returnTo = searchParams.get("returnTo");
    const garantiaId = searchParams.get("garantiaId" + params);

    const { data, status } = await fetchCheckCode({
      phoneNumber: phoneNumber ?? "",
      code: formData.confirmationCode,
    });

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(data.errors) as Array<keyof RegisterFormData>).forEach(
        (key) => {
          setError(key, {
            type: "manual",
            message: t(
              `register:inputs.${key}.validation.server.${data.errors[key]}`
            ),
          });
        }
      );

      return;
    }
    /*
    if (status === HTTP_CODES_ENUM.PRECONDITION_REQUIRED) {
      enqueueSnackbar(t("register:alerts.wrong"), {
        variant: "error",
      });
    }

    if (status === HTTP_CODES_ENUM.TOO_MANY_REQUESTS) {
      enqueueSnackbar(t("register:alerts.exceeded"), {
        variant: "error",
      });

      router.replace("/check-phone-number");
    }
*/
    if (status === HTTP_CODES_ENUM.OK) {
      enqueueSnackbar(t("register:alerts.codeConfirmed"), {
        variant: "success",
      });
      // Save phone number to cookie after successful verification
      // Add + prefix if not present to match the format used in check-phone-number
      if (phoneNumber) {
        const formattedPhone = phoneNumber.startsWith("+")
          ? phoneNumber
          : `+${phoneNumber}`;
        setPhoneNumberCookie(formattedPhone);
      }
      if (data.user) {
        setTokensInfo({
          token: data.token,
          refreshToken: data.refreshToken,
          tokenExpires: data.tokenExpires,
        });
        setUser(data.user);
        setReturningUserCookie();

        // Clear referral code cookie after successful phone verification
        clearReferralCodeCookie();

        // If returnTo is provided, redirect there after login
        if (returnTo) {
          router.replace(decodeURIComponent(returnTo));
        } else if (garantiaId) {
          router.replace(`${garantiaId}/register`);
        } else {
          // Check if user needs onboarding
          // Make direct fetch call with token to avoid timing issues with useFetch hook
          try {
            const userId = data.user.id || data.user._id;
            console.log("Checking onboarding status for user:", userId);

            // API_URL already includes /v1, so we use it directly
            const onboardingUrl = `${API_URL}/v1/onboarding/${userId}/status`;
            console.log("Fetching onboarding status from:", onboardingUrl);
            const response = await fetch(onboardingUrl, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.token}`,
                "x-custom-lang": params.language || "pt",
              },
            });

            console.log(
              "Onboarding status response:",
              response.status,
              response.statusText
            );

            if (response.ok) {
              const onboardingData = await response.json();
              console.log("Onboarding data:", onboardingData);

              if (onboardingData.needsOnboarding) {
                console.log(
                  "User needs onboarding, redirecting to /onboarding"
                );
                // Include language in the path to avoid middleware redirect
                router.replace(`/${params.language}/onboarding`);
              } else {
                console.log(
                  "User does not need onboarding, redirecting to home"
                );
                // Redirect to dashboard (home page)
                router.replace(`/`);
              }
            } else {
              // If request fails, redirect to dashboard
              const errorText = await response.text();
              console.error(
                "Failed to check onboarding status:",
                response.status,
                errorText
              );
              router.replace(`/`);
            }
          } catch (error) {
            console.error("Error checking onboarding status:", error);
            // If onboarding check fails, redirect to dashboard
            router.replace(`/`);
          }
        }
      } else {
        // console.log({ go: "sign-up" });
        const signUpUrl = `sign-up?p=${phoneNumber}${
          returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""
        }`;
        router.replace(signUpUrl);
      }
    }
  });

  return (
    <>
      <Container maxWidth="xs" className="mainContainer">
        <Grid
          container
          spacing={2}
          pt={3}
          direction="column"
          sx={{ minHeight: "60vh", alignItems: "start" }}
        >
          <Grid item xs={12} md={12}>
            <h1 style={{ marginTop: 0, textAlign: "left" }}>
              {t("register:workflow.get-code.title")}
            </h1>
          </Grid>
          <FormProvider {...methods}>
            <Container maxWidth="xs">
              <form onSubmit={onSubmit}>
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={5}>
                    <FormTextInput<RegisterFormData>
                      name="confirmationCode"
                      label={t("register:inputs.code.label")}
                      type="code"
                      testId="code"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormActions />
                  </Grid>
                </Grid>
              </form>
            </Container>
          </FormProvider>
        </Grid>
      </Container>
    </>
  );
}

function ConfirmCode(props: Props) {
  return <Form params={props.params} />;
}

export default ConfirmCode;
