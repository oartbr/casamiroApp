import type { Metadata } from "next";
import { Suspense } from "react";
import Profile from "./page-content";
import { getServerTranslation } from "@/services/i18n";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "profile");

  return {
    title: t("title"),
  };
}

export default function ProfilePage(props: Props) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile {...props} />
    </Suspense>
  );
}
