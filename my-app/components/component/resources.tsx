import { Navbar } from "@/components/navbar"
import { ResourcesComponent } from "@/components/component/resourcesComponent"


export function Resources() {
  return (
    <div className="relative">
      <Navbar />
      <main className="pt-20">
        <ResourcesComponent />
      </main>
    </div>
  )
}



