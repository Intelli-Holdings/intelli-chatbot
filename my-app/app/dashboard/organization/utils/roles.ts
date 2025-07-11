import { useOrganization } from "@clerk/nextjs"

export const useIsOrgAdmin = () => {
  const { membership } = useOrganization()
  return membership?.role === "org:admin"
}
