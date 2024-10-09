import instance, { AxiosError } from "../../utils/axios"
import createHttpError, { HttpError } from "http-errors"
import { CheerioAPI, load } from "cheerio"
import { type IEpisodeServer } from "../../types/types"
import { gogoBaseUrl } from "../../utils/constants"

export const fetchEpisodeServers = async (
  episodeId: string
): Promise<IEpisodeServer[] | HttpError> => {
  try {
    if (!episodeId.startsWith(gogoBaseUrl)) episodeId = `/${episodeId}`

    const res = await instance(gogoBaseUrl).get(episodeId)

    const $: CheerioAPI = load(res.data)

    const servers: IEpisodeServer[] = []

    $("div.anime_video_body > div.anime_muti_link > ul > li").each((i, el) => {
      let url = $(el).find("a").attr("data-video")
      if (!url?.startsWith("http")) url = `https:${url}`

      servers.push({
        name: $(el).find("a").text().replace("Choose this server", "").trim(),
        url: url,
      })
    })

    return servers
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
