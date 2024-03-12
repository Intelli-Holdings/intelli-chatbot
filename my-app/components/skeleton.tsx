import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonLoader(
    ) {
      return (
        <div className="w-full">
          <div className="items-center">
          <Skeleton className="h-2 w-[250px]" />
          </div>
          
            
            <div className="w-full ">
              <Skeleton className="h-1 w-[190px]" />
              <Skeleton className="h-1 w-[150px]" />
            </div>
          </div>
        
      );
    }
    