const axios = require('axios')

module.exports.GET = async (req, url, params) => {
  try {
    let result = await axios.get(process.env.API_GATEWAY_URL + url, {
      withCredentials: true,
      params: params,
      headers: {
        cookie: req?.headers?.cookie
      }
    })
    if (result?.data?.isError) {
      return null
    } else {
      return result?.data?.body
    }
  } catch (e) {
    console.log(e)
    return null
  }
}
