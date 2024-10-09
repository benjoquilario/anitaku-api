import { ISearch, IAnimeResult } from "../../types/types"
import createHttpError, { HttpError } from "http-errors"
import { CheerioAPI, load } from "cheerio"
import instance, { AxiosError } from "../../utils/axios"
import { gogoBaseUrl } from "../../utils/constants"

export const fetchGenreInfo = async (
  genre: string,
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  try {
    const res = await instance(gogoBaseUrl).get(`/genre/${genre}?page=${page}`)

    const $: CheerioAPI = load(res.data)

    const genreInfo: IAnimeResult[] = []

    $("div.last_episodes > ul > li").each((i, elem) => {
      genreInfo.push({
        id: $(elem).find("p.name > a").attr("href")?.split("/")[2] as string,
        title: $(elem).find("p.name > a").text() as string,
        image: $(elem).find("div > a > img").attr("src"),
        released: $(elem)
          .find("p.released")
          .text()
          .replace("Released: ", "")
          .trim(),
        url: gogoBaseUrl + "/" + $(elem).find("p.name > a").attr("href"),
      })
    })

    const paginatorDom = $("div.anime_name_pagination > div > ul > li")
    const hasNextPage =
      paginatorDom.length > 0 && !paginatorDom.last().hasClass("selected")
    return {
      currentPage: page,
      hasNextPage: hasNextPage,
      results: genreInfo,
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

export const fetchGenreList = async (): Promise<
  { id: string | undefined; title: string | undefined }[] | HttpError
> => {
  const genres: { id: string | undefined; title: string | undefined }[] = []
  let res = null
  try {
    res = await instance(gogoBaseUrl).get(`/home.html`)
  } catch (err) {
    try {
      res = await instance(gogoBaseUrl).get(`/`)
    } catch (error) {
      throw new Error("Something went wrong. Please try again later.")
    }
  }
  try {
    const $ = load(res.data)
    $("nav.menu_series.genre.right > ul > li").each((_index, element) => {
      const genre = $(element).find("a")
      genres.push(
        {
          id: genre.attr("href")?.replace("/genre/", ""),
          title: genre.attr("title"),
        }!
      )
    })
    return genres
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
