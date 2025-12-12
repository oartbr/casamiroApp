import type { Metadata } from "next";
import { Suspense } from "react";
import Referrals from "./page-content";
import { getServerTranslation } from "@/services/i18n";
import { generateOpenGraphMetadata } from "@/lib/metadata";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "referral");

  return generateOpenGraphMetadata({
    title: t("title"),
    description: t("ogDescription", {
      defaultValue:
        "Compartilhe seu link de indicação e ganhe reconhecimento! Convide amigos e familiares para economizar com Casamiro.",
    }),
    url: `/${params.language}/referrals`,
  });
}

export default function ReferralsPage(props: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Referrals {...props} />
    </Suspense>
  );
}
