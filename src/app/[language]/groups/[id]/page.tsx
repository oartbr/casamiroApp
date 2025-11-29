import { Suspense } from "react";
import PageContent from "./page-content";
import { GroupDetailSkeleton } from "@/components/skeletons/GroupDetailSkeleton";
import { getServerTranslation } from "@/services/i18n";
import { Metadata } from "next";

type Props = {
  params: { language: string; id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "groups");

  return {
    title: t("title"),
  };
}

export default function GroupDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<GroupDetailSkeleton />}>
      <PageContent params={{ ...params, slug: "", id: params.id }} />
    </Suspense>
  );
}
