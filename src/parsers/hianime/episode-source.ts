import MegaCloud from "../../extractors/megacloud"
import RapidCloud from "../../extractors/rapidcloud"
import StreamSB from "../../extractors/streamsb"
import StreamTape from "../../extractors/streamtape"
import { StreamingServers, type ISource } from "../../types/types"
import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../../utils"
import instance, { AxiosError } from "../../utils/axios"
import { hiAnimeBaseUrl } from "../../utils/constants"
import createHttpError from "http-errors"
import { CheerioAPI, load } from "cheerio"
import { retrieveServerId } from "../../utils/methods"

export const fetchEpisodeSource = async (
  episodeId: string,
  server: StreamingServers = StreamingServers.VidCloud,
  category: "sub" | "dub" | "raw" = "sub"
): Promise<ISource> => {
  if (episodeId.startsWith("http")) {
    const serverUrl = new URL(episodeId)

    switch (server) {
      case StreamingServers.VidStreaming:
      case StreamingServers.VidCloud:
        return {
          ...(await new MegaCloud().extract(serverUrl)),
        }
      case StreamingServers.StreamSB:
        return {
          headers: {
            Referer: serverUrl.href,
            watchsb: "streamsb",
            "User-Agent": USER_AGENT,
          },
          sources: await new StreamSB().extract(serverUrl, true),
        }
      case StreamingServers.StreamTape:
        return {
          headers: { Referer: serverUrl.href, "User-Agent": USER_AGENT },
          sources: await new StreamTape().extract(serverUrl),
        }
      default: // vidcloud
        return {
          headers: { Referer: serverUrl.href },
          ...(await new RapidCloud().extract(serverUrl)),
        }
    }
  }

  const epId = `${hiAnimeBaseUrl}/watch/${episodeId
    .replace("$ep$", "?ep=")
    .replace(/\$auto|\$sub|\$dub/gi, "")}`

  try {
    const { data } = await instance(hiAnimeBaseUrl).get(
      `/ajax/v2/episode/servers?episodeId=${epId.split("?ep=")[1]}`,
      {
        headers: {
          Referer: epId,
          "User-Agent": USER_AGENT,
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    )

    const $ = load(data.html)

    let serverId: string | null = null

    try {
      switch (server) {
        case StreamingServers.VidCloud: {
          serverId = retrieveServerId($, 1, category)
          if (!serverId) throw new Error("RapidCloud not found")
          break
        }
        case StreamingServers.VidStreaming: {
          serverId = retrieveServerId($, 4, category)
          if (!serverId) throw new Error("VidStreaming not found")
          break
        }
        case StreamingServers.StreamSB: {
          serverId = retrieveServerId($, 5, category)
          if (!serverId) throw new Error("StreamSB not found")
          break
        }
        case StreamingServers.StreamTape: {
          serverId = retrieveServerId($, 3, category)
          if (!serverId) throw new Error("StreamTape not found")
          break
        }
      }
    } catch (err) {
      throw createHttpError.NotFound("Couldn't find server. Try another server")
    }

    const {
      data: { link },
    } = await instance(hiAnimeBaseUrl).get(
      `/ajax/v2/episode/sources?id=${serverId}`
    )

    return await fetchEpisodeSource(link, server)
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
