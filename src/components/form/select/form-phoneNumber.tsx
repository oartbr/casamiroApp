import React, { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import FormSelectInput from "@/components/form/select/form-select";
import FormTextInput from "@/components/form/text-input/form-text-input";
import Grid from "@mui/material/Grid";
import { getCountryDataList, ICountryData } from "countries-list";

/*
Regions:{
  AF = 'Africa',
  AN = 'Antarctica',
  AS = 'Asia',
  EU = 'Europe',
  NA = 'North America',
  OC = 'Oceania',
  SA = 'South America'
}
*/

interface PhoneNumberInputProps {
  name: string;
  areaCodeLabel: string;
  areaCodeDefault?: string;
  numberLabel: string;
  defaultValue?: string;
  region?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  name,
  areaCodeLabel,
  areaCodeDefault,
  numberLabel,
  defaultValue,
  // region,
}) => {
  const { control, setValue } = useFormContext();
  const areaCode = useWatch({ name: `areaCode` });
  const phNumber = useWatch({ name: `phNumber` });

  const countryCodes = getCountryDataList()
    .filter(
      (country: ICountryData) =>
        // region ? country.continent === region : true
        country.name === "Brazil"
    )
    .map((country: ICountryData) => {
      return {
        label: "Brasil +55",
        value: country.iso2,
        code: country.phone,
      };
    });

  const countryRenderOption = (option: { label: string }) => option.label;

  useEffect(() => {
    if (areaCode && phNumber) {
      setValue(name, `${areaCode.code}${phNumber}`);
    }
  }, [areaCode, phNumber, setValue, name]);

  setValue(name, `${areaCode}${phNumber}`);

  return (
    <Grid container spacing={2}>
      <Grid item xs={5}>
        <Controller
          name={`areaCode`}
          defaultValue={areaCodeDefault ? countryCodes[0] : {}}
          control={control}
          render={({ field, fieldState }) => (
            <FormSelectInput
              {...field}
              label={areaCodeLabel}
              options={countryCodes}
              error={fieldState.error?.message}
              renderOption={countryRenderOption}
              keyValue={"value"}
              ref={null}
            />
          )}
        />
      </Grid>
      <Grid item xs={7}>
        <Controller
          name={`phNumber`}
          defaultValue={defaultValue ? defaultValue : ""}
          control={control}
          render={({ field, fieldState }) => (
            <FormTextInput
              {...field}
              label={numberLabel}
              error={fieldState.error?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default PhoneNumberInput;
