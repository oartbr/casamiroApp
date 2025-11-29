import { Metadata } from "next";
import { Suspense } from "react";
import ListsPageContent from "./page-content";
import { ListsSkeleton } from "@/components/skeletons/ListsSkeleton";
import { getServerTranslation } from "@/services/i18n";

export async function generateMetadata({
  params,
}: ListsPageProps): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "lists");

  return {
    title: t("title"),
  };
}
interface ListsPageProps {
  params: { language: string };
}

export default function ListsPage({ params }: ListsPageProps) {
  return (
    <Suspense fallback={<ListsSkeleton />}>
      <ListsPageContent params={params} />
    </Suspense>
  );
}
