import { type CheerioAPI } from "cheerio"
import { IAnimeResult, MediaFormat } from "../types/types"
import createHttpError, { HttpError } from "http-errors"

export const scrapeCard = (
  $: CheerioAPI,
  baseUrl: string,
  selector: string
): Array<IAnimeResult> => {
  try {
    const results: IAnimeResult[] = []

    $(selector).each((i, ele) => {
      const card = $(ele)
      const atag = card.find(".film-name a")
      const id = atag.attr("href")?.split("/")[1].split("?")[0]
      const type = card
        .find(".fdi-item")
        ?.first()
        ?.text()
        .replace(" (? eps)", "")
        .replace(/\s\(\d+ eps\)/g, "")
      results.push({
        id: id!,
        title: atag.text(),
        url: `${baseUrl}${atag.attr("href")}`,
        image: card.find("img")?.attr("data-src"),
        duration: card.find(".fdi-duration")?.text(),
        japaneseTitle: atag.attr("data-jname"),
        type: type as MediaFormat,
        nsfw: card.find(".tick-rate")?.text() === "18+" ? true : false,
        sub: parseInt(card.find(".tick-item.tick-sub")?.text()) || 0,
        dub: parseInt(card.find(".tick-item.tick-dub")?.text()) || 0,
        episodes: parseInt(card.find(".tick-item.tick-eps")?.text()) || 0,
      })
    })
    return results
  } catch (err) {
    throw createHttpError.InternalServerError(
      // @ts-ignore
      err?.message || "Something went wrong"
    )
  }
}

export function retrieveServerId(
  $: CheerioAPI,
  index: number,
  category: "sub" | "dub" | "raw"
) {
  return (
    $(`.ps_-block.ps_-block-sub.servers-${category} > .ps__-list .server-item`)
      ?.map((_, el) =>
        $(el).attr("data-server-id") == `${index}` ? $(el) : null
      )
      ?.get()[0]
      ?.attr("data-id") || null
  )
}
