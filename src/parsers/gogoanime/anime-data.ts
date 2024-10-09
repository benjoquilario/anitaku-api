import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../../utils"
import {
  type IAnimeInfo,
  SubOrSub,
  MediaFormat,
  MediaStatus,
} from "../../types/types"
import { gogoTakuUrl, gogoBaseUrl } from "../../utils/constants"
import instance, { AxiosError } from "../../utils/axios"
import { CheerioAPI, load } from "cheerio"
import createHttpError from "http-errors"

export const fetchAnimeData = async (id: string) => {
  const animeInfo: IAnimeInfo = {
    id: "",
    title: "",
    url: "",
    genres: [],
  }

  try {
    if (!id.includes("gogoanime")) id = `/category/${id}`

    const { data } = await instance(gogoTakuUrl).get(id, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
      },
    })

    const $: CheerioAPI = load(data)

    const info = $("div.anime_info_body_bg")

    animeInfo.id = new URL(id).pathname.split("/")[2]
    animeInfo.title = $(
      "section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > h1"
    )
      .text()
      .trim()
    animeInfo.url = `${gogoBaseUrl}/category/${new URL(id).pathname.split("/")[2]}`
    animeInfo.image = $("div.anime_info_body_bg > img").attr("data-original")
    animeInfo.releaseDate = $("div.anime_info_body_bg > p:nth-child(7)")
      .text()
      .trim()
      .replace("Released: ", "")

    animeInfo.description = $("div.anime_info_body_bg > div.description")
      .text()
      .trim()
      .replace("Plot Summary: ", "")

    animeInfo.subOrDub = animeInfo.title.toLowerCase().includes("dub")
      ? SubOrSub.DUB
      : SubOrSub.SUB

    animeInfo.type = $("div.anime_info_body_bg > p:nth-child(3)")
      .text()
      .trim()
      .replace("Type: ", "") as MediaFormat

    animeInfo.status = MediaStatus.UNKNOWN

    switch (
      $("div.anime_info_body_bg > p:nth-child(8)")
        .text()
        .trim()
        .replace("Status: ", "")
    ) {
      case "Ongoing":
        animeInfo.status = MediaStatus.ONGOING
        break
      case "Completed":
        animeInfo.status = MediaStatus.COMPLETED
        break
      case "Upcoming":
        animeInfo.status = MediaStatus.NOT_YET_AIRED
        break
      default:
        animeInfo.status = MediaStatus.UNKNOWN
        break
    }
    animeInfo.otherName = $("div.anime_info_body_bg > p:nth-child(10) > a")
      .text()
      .replace("Other name: ", "")
      .replace(/;/g, ",")

    animeInfo.genres = $("div.anime_info_body_bg > p:nth-child(6)")
      .text()
      .replace("Genre: ", "")
      .split(", ")

    animeInfo.countryOfOrigin = $("div.anime_info_body_bg > p:nth-child(9)")
      .text()
      .replace("Country: ", "")

    animeInfo.airDate = $("div.anime_info_body_bg > p:nth-child(11)")
      .text()
      .replace("Aired: ", "")
    animeInfo.relations = []

    $("div.page_content.related_anime > ul > li").each((i, el) => {
      animeInfo.relations?.push({
        id: $(el).find("div.name > a").attr("href")?.replace("/category/", "")!,
        title:
          $(el).find("div.name > a").attr("title")! ??
          $(el).find("div.name > a > h4").text()!,
        image: $(el).find("div.img > a img").attr("data-original"),
        releaseDate: $(el)
          .find("p.released")
          .text()
          .replace("Released: ", "")
          .trim(),
      })
    })

    animeInfo.charactersAndVoiceActors = []

    $("div.list_characters_voice > ul > li").each((i, el) => {
      animeInfo.charactersAndVoiceActors?.push({
        characters: {
          image: $(el)
            .find("div.left div.picture div.img > a img")
            .attr("data-original"),
          id: $(el)
            .find("div.left div.picture div.img > a")
            .attr("href")
            ?.replace("/characters", ""),
          title: $(el).find("div.left div.bottom p.title > a").attr("title"),
          roles: $(el).find("div.left div.bottom p.roles").text().trim(),
        },
        voiceActors: {
          image: $(el)
            .find("div.right div.picture div.img > a img")
            .attr("data-original"),
          id: $(el)
            .find("div.right div.picture div.img > a")
            .attr("href")
            ?.replace("/characters", ""),
          title: $(el).find("div.right div.bottom p.title > a").attr("title"),
          roles: $(el).find("div.right div.bottom p.roles").text().trim(),
        },
      })
    })

    return animeInfo
  } catch (err) {
    if (err instanceof AxiosError) {
      throw createHttpError(
        err?.response?.status || 500,
        err?.response?.statusText || "Something went wrong"
      )
    }
    // @ts-ignore
    throw createHttpError.InternalServerError(err?.message)
  }
}
