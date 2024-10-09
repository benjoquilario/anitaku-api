import axios, { AxiosError } from "axios"

const instance = (baseUrl: string) => {
  return axios.create({
    baseURL: baseUrl,
  })
}

export { AxiosError }
export default instance
