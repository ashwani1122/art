import { NextResponse } from "next/server";

const groups = [
  { id: "wildlife", label: "Animals & birds", query: "incategory:Photographs_of_birds OR incategory:Photographs_of_animals" },
  { id: "butterflies", label: "Butterflies", query: "incategory:Butterflies" },
  { id: "landscapes", label: "Mountains, rivers & waterfalls", query: "incategory:Landscape_photographs" },
  { id: "places", label: "Iconic places", query: "incategory:World_Heritage_Sites" },
  { id: "walls", label: "Walls & interiors", query: "incategory:Building_interiors" },
] as const;

type CommonsPage = {
  pageid: number;
  title: string;
  imageinfo?: Array<{ thumburl?: string; descriptionurl?: string; extmetadata?: { Artist?: { value?: string }; LicenseShortName?: { value?: string } } }>;
};

async function searchCommons(group: (typeof groups)[number]) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", group.query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "24");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|extmetadata");
  url.searchParams.set("iiurlwidth", "720");
  url.searchParams.set("format", "json");
  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) return [];
  const data = await response.json() as { query?: { pages?: Record<string, CommonsPage> } };
  return Object.values(data.query?.pages ?? {}).flatMap((page) => {
    const info = page.imageinfo?.[0];
    if (!info?.thumburl || !info.descriptionurl) return [];
    return [{
      id: `${group.id}-${page.pageid}`,
      title: page.title.replace(/^File:/, "").replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[_-]+/g, " "),
      image: info.thumburl,
      sourceUrl: info.descriptionurl,
      credit: info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, "") || "Wikimedia Commons",
      license: info.extmetadata?.LicenseShortName?.value || "Free media",
      groupId: group.id,
      groupLabel: group.label,
    }];
  });
}

export async function GET() {
  const results = await Promise.all(groups.map((group) => searchCommons(group).catch(() => [])));
  return NextResponse.json({ groups, items: results.flat() }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
