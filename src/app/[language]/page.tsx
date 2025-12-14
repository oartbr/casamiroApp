import type { Metadata } from "next";
import { Suspense } from "react";
import { getServerTranslation } from "@/services/i18n";
import PageContent from "./dashboard";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { generateOpenGraphMetadata } from "@/lib/metadata";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "home");
  const { t: tCommon } = await getServerTranslation(params.language, "common");

  return generateOpenGraphMetadata({
    title: t("title"),
    description: tCommon("ogDescription", {
      defaultValue:
        "O jeito inteligente da sua família economizar nas compras. Desbloqueie preços melhores e reduza gastos desnecessários com a ajuda da inteligência artificial.",
    }),
    url: `/`,
    image: "shopping.png",
  });
}

export default async function Home({ params }: Props) {
  await getServerTranslation(params.language, "home");
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <PageContent />
    </Suspense>
  );
}
