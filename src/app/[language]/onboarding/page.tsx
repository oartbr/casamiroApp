import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import PageContent from "./page-content";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "onboarding");

  return {
    title: t("title", { defaultValue: "Onboarding - Casamiro" }),
  };
}

export default async function Onboarding({ params }: Props) {
  await getServerTranslation(params.language, "onboarding");
  return <PageContent params={params} />;
}
