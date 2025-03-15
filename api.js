import axios from 'axios'

export async function getData() {
  const data = []
  await axios
    .get(
      `https://apidata.mos.ru/v1/datasets/2985/features?api_key=${process.env.MOS_BASE_API_KEY}`
    )
    .then(function (response) {
      const result = response.data.features.map((item) => {
        return {
          name: item.properties.attributes.Name,
          address: item.properties.attributes.Address,
          coordinates: item.geometry.coordinates.reverse(),
        }
      })

      data.push(...result)
    })
    .catch(function (error) {
      console.log(error)
    })
  return data
}
