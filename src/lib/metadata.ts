import type { Metadata } from "next";

export interface OpenGraphMetadata {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

/**
 * Get the base URL for the application (server-side only)
 */
export function getBaseUrl(): string {
  // Server-side rendering
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Default production URL
  return "https://casamiro.ai";
}

/**
 * Generate full Open Graph metadata for Next.js
 */
export function generateOpenGraphMetadata({
  title,
  description,
  image,
  url,
  type = "website",
  siteName = "Casamiro",
}: OpenGraphMetadata): Metadata {
  const baseUrl = getBaseUrl();

  // Default OG image - should be 1200x630px
  const defaultImage = `${baseUrl}/assets/images/hero1.png`;
  const ogImage = image || defaultImage;

  // Ensure absolute URLs for OG image
  const ogImageUrl = ogImage.startsWith("http")
    ? ogImage
    : `${baseUrl}${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}`;

  // Construct full URL
  const fullUrl = url
    ? url.startsWith("http")
      ? url
      : `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`
    : baseUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "pt_BR",
      type: type as "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    metadataBase: new URL(baseUrl),
  };
}
