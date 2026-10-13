import type { Metadata } from "next"

import { baseKeywords } from "./keywords"
export { baseKeywords } from "./keywords"

const defaultDescription =
  "We craft custom software and AI automation built to help businesses run smarter, cut inefficiencies, and scale."
const defaultUrl = "https://mnemora.org"

export interface MetadataConfig extends Omit<Metadata, "description" | "keywords"> {
  name: string
  url?: string
  ogImage?: string
  description?: string
  keywords?: string[]
}

export function createMetadata(config: MetadataConfig): Metadata {
  const {
    name,
    url = defaultUrl,
    ogImage = `${url}/og.png`,
    description = defaultDescription,
    keywords = baseKeywords,
    ...rest
  } = config

  return {
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description,
    keywords,
    authors: [
      {
        name: "Mnemora",
        url,
      },
    ],
    creator: "Mnemora",
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      title: name,
      description,
      siteName: name,
      ...(config.openGraph || {}),
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: [ogImage],
      creator: "@mnemoraorg",
      ...(config.twitter || {}),
    },
    icons: {
      icon: "/favicon.ico",
    },
    manifest: "/site.webmanifest",
    ...rest,
  }
}
