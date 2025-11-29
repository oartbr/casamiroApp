import { Suspense } from "react";
import PageContent from "./page-content";
import { GroupsListSkeleton } from "@/components/skeletons/GroupsListSkeleton";
import { getServerTranslation } from "@/services/i18n";
import { Metadata } from "next";

interface GroupsPageProps {
  params: { language: string };
}

export async function generateMetadata({
  params,
}: GroupsPageProps): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "groups");

  return {
    title: t("title"),
  };
}

export default function GroupsPage({ params }: GroupsPageProps) {
  return (
    <Suspense fallback={<GroupsListSkeleton />}>
      <PageContent params={{ ...params, slug: "", id: "" }} />
    </Suspense>
  );
}
