"use client";
import Button from "@mui/material/Button";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { useAuthSignUpService } from "@/services/api/services/auth";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import FormTextInput from "@/components/form/text-input/form-text-input";
import FormCheckboxInput from "@/components/form/checkbox/form-checkbox";
import PhoneNumberInput from "@/components/form/select/form-phoneNumber";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "@/components/link";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import SocialAuth from "@/services/social-auth/social-auth";
import { isGoogleAuthEnabled } from "@/services/social-auth/google/google-config";
import { isFacebookAuthEnabled } from "@/services/social-auth/facebook/facebook-config";
import { useRouter, useSearchParams } from "next/navigation";
import { getReferralCodeCookie } from "@/services/auth/referral-cookie";
import { useSnackbar } from "notistack";
// import { Phone } from "@mui/icons-material";

type Props = {
  params: { id: string; language: string; slug: string };
};

type TPolicy = {
  id: string;
  name: string;
};

type SignUpFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  policy: TPolicy[];
  phoneNumber: string;
  phNumber?: string;
  areaCode?: Record<string, string>;
};

const useValidationSchema = () => {
  const { t } = useTranslation("sign-up");

  return yup.object().shape({
    firstName: yup
      .string()
      .required(t("sign-up:inputs.name.validation.required")),
    lastName: yup
      .string()
      .required(t("sign-up:inputs.lastName.validation.required")),
    email: yup
      .string()
      .email(t("sign-up:inputs.email.validation.invalid"))
      .required(t("sign-up:inputs.email.validation.required")),
    password: yup
      .string()
      .min(6, t("sign-up:inputs.password.validation.min"))
      .required(t("sign-up:inputs.password.validation.required")),
    policy: yup
      .array()
      .min(1, t("sign-up:inputs.policy.validation.required"))
      .required(),
    phoneNumber: yup
      .string()
      .required(t("sign-up:inputs.phoneNumber.validation.required")),
    phNumber: yup.string().optional(),
    areaCode: yup.object().optional(),
  });
};

function FormActions() {
  const { t } = useTranslation("sign-up");
  const { isSubmitting } = useFormState();

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
      data-testid="sign-up-submit"
    >
      {t("sign-up:actions.submit")}
    </Button>
  );
}

function Form(props: Props) {
  const fetchAuthSignUp = useAuthSignUpService();
  const { t } = useTranslation("sign-up");
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const validationSchema = useValidationSchema();
  const policyOptions = [
    { id: "policy", name: t("sign-up:inputs.policy.agreement") },
  ];
  const garantiaId = props.params.id;
  const sPhoneNumber = searchParams.get("p");
  const returnTo = searchParams.get("returnTo");
  // Get referral code from URL parameter first, then from cookie
  const referralCodeFromUrl = searchParams.get("ref");
  const referralCodeFromCookie = getReferralCodeCookie();
  const referralCode = referralCodeFromUrl || referralCodeFromCookie;

  const methods = useForm<SignUpFormData>({
    resolver: yupResolver<SignUpFormData>(validationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      policy: [],
      phoneNumber: "",
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    formData.phoneNumber =
      (formData?.areaCode?.code?.[0] || "") + (formData?.phNumber || "");

    delete formData.phNumber;
    delete formData.areaCode;

    // Add referral code if present in URL
    const signUpData: SignUpFormData & { referredByCode?: string } = {
      ...formData,
    };
    if (referralCode) {
      signUpData.referredByCode = referralCode.toUpperCase();
    }

    const { data: dataSignUp, status: statusSignUp } =
      await fetchAuthSignUp(signUpData);

    if (statusSignUp === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(dataSignUp.errors) as Array<keyof SignUpFormData>).forEach(
        (key) => {
          setError(key, {
            type: "manual",
            message: t(
              `sign-up:inputs.${key}.validation.server.${dataSignUp.errors[key]}`
            ),
          });
        }
      );

      return;
    }

    if (statusSignUp === HTTP_CODES_ENUM.CREATED) {
      // User created with GUEST role - verification code sent to WhatsApp
      // Don't set tokens yet - user needs to verify phone first

      // Redirect to confirm-code page with phone number
      // Format phone number with + prefix for confirm-code page
      let phoneNumberForUrl = formData.phoneNumber;
      if (phoneNumberForUrl && !phoneNumberForUrl.startsWith("+")) {
        phoneNumberForUrl = `+${phoneNumberForUrl}`;
      }
      const confirmCodeUrl = `confirm-code?p=${phoneNumberForUrl}${
        returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""
      }${garantiaId ? `&garantiaId=${garantiaId}` : ""}`;

      enqueueSnackbar(t("sign-up:alerts.codeSent"), {
        variant: "success",
      });

      router.replace(confirmCodeUrl);
    }
  });

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xs">
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} mt={3}>
              <Typography variant="h6">{t("sign-up:title")}</Typography>
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<SignUpFormData>
                name="firstName"
                label={t("sign-up:inputs.firstName.label")}
                type="text"
                autoFocus
                testId="first-name"
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<SignUpFormData>
                name="lastName"
                label={t("sign-up:inputs.lastName.label")}
                type="text"
                testId="last-name"
              />
            </Grid>

            <Grid item xs={12} style={{ display: "block" }}>
              <PhoneNumberInput
                name="phoneNumber"
                numberLabel={t("sign-up:inputs.phoneNumber.label")}
                areaCodeLabel={t("sign-up:inputs.areaCode.label")}
                defaultValue={sPhoneNumber || ""}
                region="SA"
                areaCodeDefault="BR"
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<SignUpFormData>
                name="email"
                label={t("sign-up:inputs.email.label")}
                type="email"
                testId="email"
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<SignUpFormData>
                name="password"
                label={t("sign-up:inputs.password.label")}
                type="password"
                testId="password"
              />
            </Grid>
            <Grid item xs={12}>
              <FormCheckboxInput
                name="policy"
                label=""
                testId="privacy"
                options={policyOptions}
                keyValue="id"
                keyExtractor={(option) => option.id.toString()}
                renderOption={(option) => (
                  <span>
                    {option.name}{" "}
                    <MuiLink href="/privacy-policy" target="_blank">
                      {t("sign-up:inputs.policy.label")}
                    </MuiLink>
                  </span>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  data-testid="login"
                  href="/check-phone-number"
                >
                  {t("sign-up:actions.accountAlreadyExists")}
                </Button>
              </Box>
            </Grid>

            {[isGoogleAuthEnabled, isFacebookAuthEnabled].some(Boolean) && (
              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }}>
                  <Chip label={t("sign-up:or")} />
                </Divider>

                <SocialAuth />
              </Grid>
            )}
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function SignUp(props: Props) {
  return <Form params={props.params} />;
}

export default withPageRequiredGuest(SignUp);
