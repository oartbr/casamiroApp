import { Metadata } from "next";
import { Suspense } from "react";
import ListsPageContent from "./page-content";
import { GroupListsSkeleton } from "@/components/skeletons/GroupListsSkeleton";
import { getServerTranslation } from "@/services/i18n";

interface ListsPageProps {
  params: { language: string; id: string };
}

export async function generateMetadata({
  params,
}: ListsPageProps): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "lists");

  return {
    title: t("title"),
  };
}

export default function ListsPage({ params }: ListsPageProps) {
  return (
    <Suspense fallback={<GroupListsSkeleton />}>
      <ListsPageContent params={params} />
    </Suspense>
  );
}
