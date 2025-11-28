import type { Metadata } from "next";
import { Suspense } from "react";
import Listing from "./page-content";
import { getServerTranslation } from "@/services/i18n";
import { ListingSkeleton } from "@/components/skeletons/ListingSkeleton";
// import { redirect } from "next/navigation";
import { IS_SIGN_UP_ENABLED } from "@/services/auth/config";

type Props = {
  params: { language: string; slug: string; id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(params.language, "listing");

  return {
    title: t("title"),
  };
}

export default function ListingPage(props: Props) {
  if (!IS_SIGN_UP_ENABLED) {
    //return redirect("/");
  }

  return (
    <Suspense fallback={<ListingSkeleton />}>
      <Listing {...props} />
    </Suspense>
  );
}
