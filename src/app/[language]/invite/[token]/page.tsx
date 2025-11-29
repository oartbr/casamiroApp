import { Suspense } from "react";
import PageContent from "./page-content";
import Loading from "../../loading";
import { getServerTranslation } from "@/services/i18n";
import { Metadata } from "next";

type Props = {
  params: { language: string; token: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "groups");

  return {
    title: t("invitations.title_invitation"),
  };
}

export default function InvitePage({ params }: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent params={params} />
    </Suspense>
  );
}
