import type { Metadata } from "next";
import ConfirmCode from "./page-content";
import { getServerTranslation } from "@/services/i18n";

type Props = {
  params: { language: string; id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "register");
  return {
    title: t("workflow.get-code.title"),
  };
}

export default ConfirmCode;
