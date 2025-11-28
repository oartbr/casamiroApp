import type { Metadata } from "next";
import { Suspense } from "react";
import { getServerTranslation } from "@/services/i18n";
import NotaDetails from "./page-content";
import { NotaDetailSkeleton } from "@/components/skeletons/NotaDetailSkeleton";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "nota");

  return {
    title: t("title"),
  };
}

export default function NotaPage(props: Props) {
  return (
    <Suspense fallback={<NotaDetailSkeleton />}>
      <NotaDetails {...props} />
    </Suspense>
  );
}
