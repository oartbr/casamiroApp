"use client";
import Button from "@mui/material/Button";
//import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { useCheckPhoneNumberLoginService } from "@/services/api/services/garantia";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import FormTextInput from "@/components/form/text-input/form-text-input";
import FormSelectInput from "@/components/form/select/form-select";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import {
  getCountryData,
  getCountryDataList,
  ICountryData,
  TCountryCode,
} from "countries-list";

type RegisterFormData = {
  phoneNumber: string;
  countryCode: { label: string; value: string };
};

const useValidationSchema = () => {
  const { t } = useTranslation("register");

  return yup.object().shape({
    phoneNumber: yup
      .string()
      .matches(
        /^\d{8,10}$|^\d{11}$/,
        t("register:inputs.phoneNumber.validation.invalid")
      )
      .required(t("register:inputs.phoneNumber.validation.required")),
    countryCode: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .required(t("register:inputs.phoneNumber.validation.required")),
  });
};

function FormActions() {
  const { t } = useTranslation("register");
  const { isSubmitting } = useFormState();
  // const params = new URLSearchParams(window.location.search);
  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
      data-testid="register/"
    >
      {t("register:workflow.confirm-phone.submit")}
    </Button>
  );
}

function Form() {
  const { enqueueSnackbar } = useSnackbar();
  const fetchSendCode = useCheckPhoneNumberLoginService();
  const { t } = useTranslation("register");
  const validationSchema = useValidationSchema();
  const router = useRouter();

  const countryVals = getCountryDataList()
    .filter((country: ICountryData) => country.continent === "SA")
    .map((country: ICountryData) => {
      return {
        label: country.native,
        value: country.iso2,
      };
    });

  const countryList = countryVals;
  const countryRenderOption = (option: { label: string }) => option.label;
  const defaultCountry = countryList.find(
    (option) => option.value === "BR"
  ) || {
    label: "",
    value: "",
  };

  const methods = useForm<RegisterFormData>({
    resolver: yupResolver<RegisterFormData>(validationSchema),
    defaultValues: {
      phoneNumber: "",
      countryCode: defaultCountry,
    },
  });

  const changeCountry = (country: { label: string; value: string }) => {
    methods.setValue("countryCode", country);
  };

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    //const params = new URLSearchParams(window.location.search);
    //const hash = params.get("hash");
    const country = getCountryData(formData.countryCode.value as TCountryCode);
    const { data, status } = await fetchSendCode({
      phoneNumber: "+" + country.phone + formData.phoneNumber,
    });

    if (status === HTTP_CODES_ENUM.OK) {
      enqueueSnackbar(t("register:alerts.codeSent"), {
        variant: "success",
      });

      router.replace(`confirm-code?p=${country.phone}${formData.phoneNumber}`);
    }

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
              {t("register:workflow.confirm-phone.title")}
            </h1>
          </Grid>
          <FormProvider {...methods}>
            <Container maxWidth="xs">
              <form onSubmit={onSubmit}>
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={6}>
                    <FormSelectInput
                      name="countryCode"
                      label={t("register:inputs.countryCode.label")}
                      options={countryList}
                      renderOption={countryRenderOption}
                      keyValue="value"
                      defaultValue={countryList.find(
                        (option) => option.value === "BR"
                      )}
                      testId="example-select-input"
                      onChange={changeCountry}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormTextInput<RegisterFormData>
                      name="phoneNumber"
                      label={t("register:inputs.phoneNumber.label")}
                      type="phoneNumber"
                      testId="phoneNumber"
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12} mt={2}>
                  <FormActions />
                </Grid>
              </form>
            </Container>
          </FormProvider>
        </Grid>
      </Container>
    </>
  );
}

function CheckPhoneNumber() {
  return <Form />;
}

export default CheckPhoneNumber;
