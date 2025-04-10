'use client'

import { useQuery } from 'react-query'

interface CountryInfo {
  country: string
  countryCode: string
}

const fetchCountryInfo = async (ip: string): Promise<CountryInfo> => {
  // Using ipinfo.io API instead of ip-api.com
  const response = await fetch(`https://ipinfo.io/${ip}/json?token=2b53dbafc8d062`)
  if (!response.ok) {
    throw new Error('Failed to fetch country info')
  }
  const data = await response.json()
  return {
    country: data.country_name || data.country, // ipinfo returns country as the ISO code
    countryCode: data.country.toLowerCase() // ipinfo returns country as the ISO code
  }
}

export function CountryInfo({ ip }: { ip: string }) {
  const { data, isLoading, error } = useQuery(['countryInfo', ip], () => fetchCountryInfo(ip), {
    retry: 2,
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!ip,
  })

  if (!ip) return <span className="text-gray-500">No IP provided</span>
  if (isLoading) return <span className="text-gray-500">Loading...</span>
  if (error) return <span className="text-gray-500">Location unavailable</span>
  if (!data) return <span className="text-gray-500">No data available</span>

  return (
    <span className="flex items-center">
      <img
        src={`https://flagcdn.com/16x12/${data.countryCode}.png`}
        alt={data.country}
        className="mr-1"
        width={16}
        height={12}
      />
      {data.country}
    </span>
  )
}