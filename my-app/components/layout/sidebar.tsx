import { DashboardNav } from "@/components/dashboard-nav";
import { navItems } from "@/constants/data";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardFooter, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  return (
    <nav
      className={cn(`relative hidden h-screen border-r pt-16 lg:block w-72`)}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">
              Menu Overview
            </h2>
            <DashboardNav items={navItems} />
            {/* <div className="pt-20 bottom-10">
                <Card>
                  <CardHeader>
                    <CardTitle>Upgrade to Premium</CardTitle>
                    <CardDescription>
                      Unlock all our features and get a dedicated account manager plus email
                      support from our team.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            
            */}
            
          </div>
        </div>
      </div>
    </nav>
  );
}
