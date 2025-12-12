import type { Metadata } from "next";
import { Suspense } from "react";
import { ReferralLanding } from "./page-content";
import { getServerTranslation } from "@/services/i18n";
import { generateOpenGraphMetadata } from "@/lib/metadata";

type Props = {
  params: { language: string; id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "referralLanding");
  const { t: tCommon } = await getServerTranslation(params.language, "common");

  return generateOpenGraphMetadata({
    title: t("title"),
    description: t("ogDescription", {
      defaultValue: tCommon("ogDescription", {
        defaultValue:
          "O jeito inteligente da sua família economizar nas compras. Desbloqueie preços melhores e reduza gastos desnecessários com a ajuda da inteligência artificial.",
      }),
    }),
    url: `/${params.language}/indique/${params.id}`,
  });
}

export default function ReferralLandingPage(props: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReferralLanding {...props} />
    </Suspense>
  );
}
