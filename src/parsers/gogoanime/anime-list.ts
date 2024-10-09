import { ISearch, IAnimeResult } from "../../types/types"
import createHttpError, { HttpError } from "http-errors"
import { gogoBaseUrl } from "../../utils/constants"
import { load } from "cheerio"
import instance, { AxiosError } from "../../utils/axios"

export const fetchAnimeList = async (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  const animeList: IAnimeResult[] = []
  let res = null
  try {
    res = await instance(gogoBaseUrl).get(`/anime-list.html?page=${page}`)
    const $ = load(res.data)
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
