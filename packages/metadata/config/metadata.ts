import type { Metadata } from "next"

import { baseKeywords } from "./keywords"
export { baseKeywords } from "./keywords"

const defaultName = "Yappi"
const defaultDescription =
  "A playful word-counting game that tracks how many times each person says karimla."
const defaultUrl = "https://yappi.mnemora.org"

export interface MetadataConfig extends Omit<Metadata, "description" | "keywords"> {
  name?: string
  url?: string
  ogImage?: string
  description?: string
  keywords?: string[]
}

export function createMetadata(config: MetadataConfig = {}): Metadata {
  const {
    name = defaultName,
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
        name: defaultName,
        url,
      },
    ],
    creator: defaultName,
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
