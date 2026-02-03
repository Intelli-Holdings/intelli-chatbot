import { Skeleton } from "@/components/ui/skeleton"
import {
  TableCell,
  TableRow,
} from "@/components/ui/table"

export function ContactSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-[80px]" />
          <Skeleton className="h-6 w-[80px]" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
      <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
    </TableRow>
  )
}

