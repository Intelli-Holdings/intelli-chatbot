import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function page() {
  return (
    <div className="grid min-h-screen w-full ">
      
      <div className="flex flex-col">       
        <div className="grid gap-4 p-4 md:gap-8 md:p-6">          
          <Card>
            <CardHeader>
              <CardTitle>Confirmed Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 text-sm">
                <Card>
                  <CardContent className="flex items-center gap-4">
                    <Link className="font-medium underline" href="#">
                      #3210
                    </Link>
                    <span className="flex-1">Olivia Martin</span>
                    <span className="hidden md:block">Online Store</span>
                    <span className="hidden md:block">February 20, 2022</span>
                    <span className="text-right">$42.25</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4">
                    <Link className="font-medium underline" href="#">
                      #3209
                    </Link>
                    <span className="flex-1">Ava Johnson</span>
                    <span className="hidden md:block">Shop</span>
                    <span className="hidden md:block">January 5, 2022</span>
                    <span className="text-right">$74.99</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4">
                    <Link className="font-medium underline" href="#">
                      #3204
                    </Link>
                    <span className="flex-1">Michael Johnson</span>
                    <span className="hidden md:block">Shop</span>
                    <span className="hidden md:block">August 3, 2021</span>
                    <span className="text-right">$64.75</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4">
                    <Link className="font-medium underline" href="#">
                      #3203
                    </Link>
                    <span className="flex-1">Lisa Anderson</span>
                    <span className="hidden md:block">Online Store</span>
                    <span className="hidden md:block">July 15, 2021</span>
                    <span className="text-right">$34.50</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4">
                    <Link className="font-medium underline" href="#">
                      #3202
                    </Link>
                    <span className="flex-1">Samantha Green</span>
                    <span className="hidden md:block">Shop</span>
                    <span className="hidden md:block">June 5, 2021</span>
                    <span className="text-right">$89.99</span>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 text-sm">
                <Card>
                  <CardContent className="flex items-center gap-4">
                    <Link className="font-medium underline" href="#">
                      #3210
                    </Link>
                    <span className="flex-1">Glimmer Lamps</span>
                    <span className="hidden md:block">In Production</span>
                    <span className="hidden md:block">500 in stock</span>
                    <span className="hidden sm:table-cell">Luminance Creations</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4">
                    <Link className="font-medium underline" href="#">
                      #3209
                    </Link>
                    <span className="flex-1">Aqua Filters</span>
                    <span className="hidden md:block">Available for Order</span>
                    <span className="hidden md:block">750 in stock</span>
                    <span className="hidden sm:table-cell">HydraClean Solutions</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4">
                    <Link className="font-medium underline" href="#">
                      #3204
                    </Link>
                    <span className="flex-1">Eco Planters</span>
                    <span className="hidden md:block">Backordered</span>
                    <span className="hidden md:block">300 in stock</span>
                    <span className="hidden sm:table-cell">GreenGrowth Designers</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4">
                    <Link className="font-medium underline" href="#">
                      #3203
                    </Link>
                    <span className="flex-1">Zest Juicers</span>
                    <span className="hidden md:block">Newly Launched</span>
                    <span className="hidden md:block">1000 in stock</span>
                    <span className="hidden sm:table-cell">FreshTech Appliances</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4">
                    <Link className="font-medium underline" href="#">
                      #3202
                    </Link>
                    <span className="flex-1">Flexi Wearables</span>
                    <span className="hidden md:block">Selling Fast</span>
                    <span className="hidden md:block">200 in stock</span>
                    <span className="hidden sm:table-cell">Vitality Gear Co.</span>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


