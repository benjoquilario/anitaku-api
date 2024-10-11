import { IScrapedEpisodeServers } from "../../types/parsers"
import instance, { AxiosError } from "../../utils/axios"
import { hiAnimeBaseUrl } from "../../utils/constants"
import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../../utils"
import { CheerioAPI, load } from "cheerio"
import createHttpError from "http-errors"

export const fetchEpisodeServers = async (episodeId: string) => {
  const results: IScrapedEpisodeServers = {
    sub: [],
    dub: [],
    raw: [],
    episodeId,
    episodeNo: 0,
  }

  try {
    const epId = episodeId.split("$ep$")[1]

    const { data } = await instance(hiAnimeBaseUrl).get(
      `/ajax/v2/episode/servers?episodeId=${epId}`,
      {
        headers: {
          Accept: ACCEPT_HEADER,
          "User-Agent": USER_AGENT,
          "X-Requested-With": "XMLHttpRequest",
          "Accept-Encoding": ACCEPT_ENCODING_HEADER,
          Referer: `${hiAnimeBaseUrl}/watch/${episodeId
            .replace("$ep$", "?ep=")
            .replace(/\$auto|\$sub|\$dub/gi, "")}`,
        },
      }
    )

    const $: CheerioAPI = load(data.html)

    const epNoSelector = ".server-notice strong"

    results.episodeNo = Number($(epNoSelector).text().split(" ").pop()) || 0
    $(`.ps_-block.ps_-block-sub.servers-sub .ps__-list .server-item`).each(
      (_, el) => {
        results.sub.push({
          serverName: $(el).find("a").text().toLowerCase().trim(),
          serverId: Number($(el)?.attr("data-server-id")?.trim()) || "",
        })
      }
    )

    $(`.ps_-block.ps_-block-sub.servers-dub .ps__-list .server-item`).each(
      (_, el) => {
        results.dub.push({
          serverName: $(el).find("a").text().toLowerCase().trim(),
          serverId: Number($(el)?.attr("data-server-id")?.trim()) || "",
        })
      }
    )

    $(`.ps_-block.ps_-block-sub.servers-raw .ps__-list .server-item`).each(
      (_, el) => {
        results.raw.push({
          serverName: $(el).find("a").text().toLowerCase().trim(),
          serverId: Number($(el)?.attr("data-server-id")?.trim()) || "",
        })
      }
    )

    return results
  } catch (err) {
    if (err instanceof AxiosError) {
      throw createHttpError(
        err?.response?.status || 500,
        err?.response?.statusText || "Something went wrong"
      )
    }
    //@ts-ignore
    throw createHttpError.InternalServerError(err?.message)
  }
}
