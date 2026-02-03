"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Target, Plus, MoreVertical, Edit, Trash2, RefreshCw, Users, Search, Calendar } from "lucide-react"
import { toast } from "sonner"

type Segment = {
  id: string
  name: string
  description: string
  contactCount: number
  criteria: string[]
  lastRefreshed: string
  createdAt: string
}

export default function SegmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newSegment, setNewSegment] = useState({
    name: "",
    description: "",
    criteria: [] as string[],
  })

  // Mock segments data
  const [segments, setSegments] = useState<Segment[]>([
    {
      id: "1",
      name: "VIP Customers",
      description: "High-value customers with frequent purchases",
      contactCount: 1247,
      criteria: ["Total spend > $500", "Active in last 30 days"],
      lastRefreshed: "2 hours ago",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Inactive Users",
      description: "Users who haven't engaged in 60+ days",
      contactCount: 876,
      criteria: ["Last activity > 60 days"],
      lastRefreshed: "1 day ago",
      createdAt: "2024-02-01",
    },
    {
      id: "3",
      name: "New Signups",
      description: "Users who joined in the last 7 days",
      contactCount: 234,
      criteria: ["Created < 7 days ago"],
      lastRefreshed: "30 minutes ago",
      createdAt: "2024-03-01",
    },
    {
      id: "4",
      name: "Email Subscribers",
      description: "Contacts who opted in for email marketing",
      contactCount: 2145,
      criteria: ["Email verified = true", "Marketing opt-in = true"],
      lastRefreshed: "3 hours ago",
      createdAt: "2024-01-20",
    },
  ])

  const handleCreateSegment = () => {
    if (!newSegment.name) {
      toast.error("Please enter a segment name")
      return
    }

    const segment: Segment = {
      id: Date.now().toString(),
      name: newSegment.name,
      description: newSegment.description,
      contactCount: 0,
      criteria: newSegment.criteria,
      lastRefreshed: "Just now",
      createdAt: new Date().toISOString().split("T")[0],
    }

    setSegments([...segments, segment])
    setShowCreateDialog(false)
    setNewSegment({ name: "", description: "", criteria: [] })
    toast.success("Segment created successfully")
  }

  const handleRefresh = (segmentId: string) => {
    toast.success("Segment refreshed successfully")
    // Update segment's lastRefreshed
    setSegments(
      segments.map((s) =>
        s.id === segmentId ? { ...s, lastRefreshed: "Just now" } : s
      )
    )
  }

  const handleDelete = (segmentId: string) => {
    setSegments(segments.filter((s) => s.id !== segmentId))
    toast.success("Segment deleted successfully")
  }

  const filteredSegments = segments.filter((segment) =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Segments</h1>
          <p className="text-muted-foreground">
            Create dynamic audience groups based on criteria
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Segment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Segments</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {segments.reduce((sum, s) => sum + s.contactCount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Segment</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...segments.map((s) => s.contactCount)).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Email Subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Updated</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segments.length}</div>
            <p className="text-xs text-muted-foreground">All segments</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search segments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Segments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Segments</CardTitle>
          <CardDescription>
            Manage your audience segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Criteria</TableHead>
                <TableHead>Contacts</TableHead>
                <TableHead>Last Refreshed</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSegments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No segments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSegments.map((segment) => (
                  <TableRow key={segment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">{segment.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground truncate">
                        {segment.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {segment.criteria.slice(0, 2).map((criterion, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {criterion}
                          </Badge>
                        ))}
                        {segment.criteria.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{segment.criteria.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {segment.contactCount.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {segment.lastRefreshed}
                      </p>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRefresh(segment.id)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(segment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Segment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Segment</DialogTitle>
            <DialogDescription>
              Define criteria to automatically group contacts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Segment Name</Label>
              <Input
                id="name"
                placeholder="e.g., VIP Customers"
                value={newSegment.name}
                onChange={(e) =>
                  setNewSegment({ ...newSegment, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What does this segment represent?"
                value={newSegment.description}
                onChange={(e) =>
                  setNewSegment({ ...newSegment, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Criteria</Label>
              <div className="space-y-2">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Add a criterion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tag">Has Tag</SelectItem>
                    <SelectItem value="spend">Total Spend</SelectItem>
                    <SelectItem value="activity">Last Activity</SelectItem>
                    <SelectItem value="created">Created Date</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Add one or more criteria to define your segment
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSegment}>Create Segment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
