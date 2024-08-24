export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
export const ACCEPT_ENCODING_HEADER = "gzip, deflate, br"
export const ACCEPT_HEADER =
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"

export const days = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
]

export function substringAfter(str: string, toFind: string) {
  const index = str.indexOf(toFind)
  return index == -1 ? "" : str.substring(index + toFind.length)
}

export function substringBefore(str: string, toFind: string) {
  const index = str.indexOf(toFind)
  return index == -1 ? "" : str.substring(0, index)
}
