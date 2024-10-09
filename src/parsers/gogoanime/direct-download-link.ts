import { CheerioAPI, load } from "cheerio"
import instance, { AxiosError } from "../../utils/axios"
import { gogoBaseUrl } from "../../utils/constants"
import createHttpError, { HttpError } from "http-errors"

export const fetchDirectDownloadLink = async (
  downloadUrl: string,
  captchaToken?: string
): Promise<
  { source: string | undefined; link: string | undefined }[] | HttpError
> => {
  const downloadLinks: {
    source: string | undefined
    link: string | undefined
  }[] = []

  const baseUrl = downloadUrl.split("?")[0]
  const idParam = downloadUrl.match(/[?&]id=([^&]+)/)
  const animeID = idParam ? idParam[1] : null
  if (!captchaToken)
    captchaToken =
      "03AFcWeA5zy7DBK82U_tctVKelJ6L2duTWac5at2zXjHLX8XqUm8tI6NKWMxGd2gjh1vi2hnEyRhVgbMhdb9WjexRsJkxTt-C-_iIIZ5yC3E5I19G5Q0buSTcIQIZS6tskrz-mDn-d37aWxAJtqbg0Yoo1XsdVc5Yf4sB-9iQxQK-W_9YLep_QaAz8uL17gMMlCz5WZM3dbBEEGmk_qPbJu_pZ8kk-lFPDzd6iBobcpyIDRZgTgD4bYUnby5WZc11i00mrRiRS3m-qSY0lprGaBqoyY1BbRkQZ25AGPp5al4kSwBZqpcVgLrs3bjdo8XVWAe73_XLa8HhqLWbz_m5Ebyl5F9awwL7w4qikGj-AK7v2G8pgjT22kDLIeenQ_ss4jYpmSzgnuTItur9pZVzpPkpqs4mzr6y274AmJjzppRTDH4VFtta_E02-R7Hc1rUD2kCYt9BqsD7kDjmetnvLtBm97q5XgBS8rQfeH4P-xqiTAsJwXlcrPybSjnwPEptqYCPX5St_BSj4NQfSuzZowXu_qKsP4hAaE9L2W36MvqePPlEm6LChBT3tnqUwcEYNe5k7lkAAbunxx8q_X5Q3iEdcFqt9_0GWHebRBd5abEbjbmoqqCoQeZt7AUvkXCRfBDne-bf25ypyTtwgyuvYMYXau3zGUjgPUO9WIotZwyKyrYmjsZJ7TiM"

  let res = null
  try {
    res = await instance(gogoBaseUrl).get(
      `?id=${animeID}&captcha_v3=${captchaToken}`
    )
  } catch (err) {
    throw new Error("Something went wrong. Please try again later.")
  }
  try {
    const $ = load(res.data)
    $(".dowload").each((_index, element) => {
      const link = $(element).find("a")
      if (link.attr("target") != "_blank") {
        downloadLinks.push({ source: link.text(), link: link.attr("href") }!)
      }
    })
    return downloadLinks
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
