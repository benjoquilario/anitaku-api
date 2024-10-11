import { scrapeCardPage } from "./scrape-card"
import { ISearch, IAnimeResult } from "../../types/types"
import { HttpError } from "http-errors"

export const search = async function (
  query: string,
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `/search?keyword=${decodeURIComponent(query)}&page=${page}`

  return scrapeCardPage(url)
}
