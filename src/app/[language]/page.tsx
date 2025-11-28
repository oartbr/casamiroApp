import type { Metadata } from "next";
import { Suspense } from "react";
import { getServerTranslation } from "@/services/i18n";
import PageContent from "./dashboard";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "home");

  return {
    title: t("title"),
  };
}

export default async function Home({ params }: Props) {
  await getServerTranslation(params.language, "home");
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <PageContent />
    </Suspense>
  );
}
