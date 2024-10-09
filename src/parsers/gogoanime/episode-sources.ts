import { StreamingServers, type ISource } from "../../types/types"
import { USER_AGENT } from "../../utils"
import StreamSB from "../../extractors/streamsb"
import GogoCDN from "../../extractors/gogocdn"
import createHttpError, { HttpError } from "http-errors"
import { CheerioAPI, load } from "cheerio"
import instance, { AxiosError } from "../../utils/axios"
import { gogoBaseUrl } from "../../utils/constants"

export const fetchEpisodeSources = async (
  episodeId: string,
  server: StreamingServers = StreamingServers.VidStreaming,
  downloadUrl: string | undefined = undefined
): Promise<ISource | HttpError> => {
  if (episodeId.startsWith("http")) {
    const serverUrl = new URL(episodeId)
    switch (server) {
      case StreamingServers.GogoCDN:
        return {
          headers: { Referer: serverUrl.href },
          sources: await new GogoCDN().extract(serverUrl),
          download: downloadUrl
            ? downloadUrl
            : `https://${serverUrl.host}/download${serverUrl.search}`,
        }
      case StreamingServers.StreamSB:
        return {
          headers: {
            Referer: serverUrl.href,
            watchsb: "streamsb",
            "User-Agent": USER_AGENT,
          },
          sources: await new StreamSB().extract(serverUrl),
          download: downloadUrl
            ? downloadUrl
            : `https://${serverUrl.host}/download${serverUrl.search}`,
        }
      case StreamingServers.StreamWish:
        return {
          headers: {
            Referer: serverUrl.href,
          },
          sources: await new StreamSB().extract(serverUrl),
          download: downloadUrl
            ? downloadUrl
            : `https://${serverUrl.host}/download${serverUrl.search}`,
        }
      default:
        return {
          headers: { Referer: serverUrl.href },
          sources: await new GogoCDN().extract(serverUrl),
          download: downloadUrl
            ? downloadUrl
            : `https://${serverUrl.host}/download${serverUrl.search}`,
        }
    }
  }

  try {
    const res = await instance(gogoBaseUrl).get(`/${episodeId}`)

    const $: CheerioAPI = load(res.data)

    let serverUrl: URL

    switch (server) {
      case StreamingServers.GogoCDN:
        serverUrl = new URL(
          `${$("#load_anime > div > div > iframe").attr("src")}`
        )
        break
      case StreamingServers.VidStreaming:
        serverUrl = new URL(
          `${$("div.anime_video_body > div.anime_muti_link > ul > li.vidcdn > a").attr("data-video")}`
        )
        break
      case StreamingServers.StreamSB:
        serverUrl = new URL(
          $(
            "div.anime_video_body > div.anime_muti_link > ul > li.streamsb > a"
          ).attr("data-video")!
        )
        break
      case StreamingServers.StreamWish:
        serverUrl = new URL(
          $(
            "div.anime_video_body > div.anime_muti_link > ul > li.streamwish > a"
          ).attr("data-video")!
        )
        break
      default:
        serverUrl = new URL(
          `${$("#load_anime > div > div > iframe").attr("src")}`
        )
        break
    }

    const downloadLink = `${$(".dowloads > a").attr("href")}`

    return downloadLink
      ? await fetchEpisodeSources(serverUrl.href, server, downloadLink)
      : await fetchEpisodeSources(serverUrl.href, server)
  } catch (err) {
    console.log(err)
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
