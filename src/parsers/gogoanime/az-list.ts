import { IAnimeResult } from "../../types/types"
import { gogoBaseUrl } from "../../utils/constants"
import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../../utils"
import instance, { AxiosError } from "../../utils/axios"
import { CheerioAPI, load } from "cheerio"
import createHttpError from "http-errors"

export const fetchAzList = async (letter: string, page: number = 1) => {
  const animeList: IAnimeResult[] = []

  try {
    const url = `/anime-list-${letter}?page=${page}`

    const { data } = await instance(gogoBaseUrl).get(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
      },
    })

    const $: CheerioAPI = load(data)

    $(".anime_list_body .listing li").each((_index, element) => {
      const genres: string[] = []
      const entryBody = $("p.type", $(element).attr("title")!)
      const genresEl = entryBody.first()

      genresEl.find("a").each((_idx, genreAnchor) => {
        genres.push($(genreAnchor).attr("title")!)
      })

      const releaseDate = $(entryBody.get(1)).text()

      const img = $("div", $(element).attr("title")!)
      const a = $(element).find("a")
      animeList.push({
        id: a.attr("href")?.replace(`/category/`, "")!,
        title: a.text(),
        image: $(img).find("img").attr("src"),
        url: `${gogoBaseUrl}${a.attr("href")}`,
        genres,
        releaseDate,
      })
    })
    const hasNextPage = !$("div.anime_name.anime_list > div > div > ul > li")
      .last()
      .hasClass("selected")
    return {
      currentPage: page,
      hasNextPage: hasNextPage,
      results: animeList,
    }
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
