"use client"

import { useState } from 'react'
import { Grid3x3, List, Search, Filter, Send, Eye, Pencil, Trash2, MoreVertical, Image as ImageIcon, Video, FileText, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TemplateTestModal } from './template-test-modal'

interface TemplateLibraryViewProps {
  templates: any[]
  loading: boolean
  appService?: any
  organizationId?: string | null
  onDelete?: (template: any) => void
  onEdit?: (template: any) => void
  onView?: (template: any) => void
}

export function TemplateLibraryView({
  templates,
  loading,
  appService,
  organizationId,
  onDelete,
  onEdit,
  onView
}: TemplateLibraryViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleTestClick = (template: any) => {
    setSelectedTemplate(template)
    setTestModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'APPROVED': 'bg-green-100 text-green-700 border-green-200',
      'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'REJECTED': 'bg-red-100 text-red-700 border-red-200',
    }
    return (
      <Badge variant="outline" className={statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-700'}>
        {status}
      </Badge>
    )
  }

  const getCategoryBadge = (category: string) => {
    const categoryStyles = {
      'MARKETING': 'bg-orange-100 text-orange-700 border-orange-200',
      'UTILITY': 'bg-blue-100 text-blue-700 border-blue-200',
      'AUTHENTICATION': 'bg-purple-100 text-purple-700 border-purple-200',
    }
    return (
      <Badge variant="outline" className={categoryStyles[category as keyof typeof categoryStyles] || 'bg-gray-100 text-gray-700'}>
        {category}
      </Badge>
    )
  }

  const getHeaderIcon = (template: any) => {
    const header = template.components?.find((c: any) => c.type === 'HEADER')
    if (!header) return null

    switch (header.format) {
      case 'IMAGE':
        return <ImageIcon className="h-4 w-4 text-gray-500" />
      case 'VIDEO':
        return <Video className="h-4 w-4 text-gray-500" />
      case 'DOCUMENT':
        return <FileText className="h-4 w-4 text-gray-500" />
      case 'LOCATION':
        return <MapPin className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search and Filters */}
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="MARKETING">Marketing</SelectItem>
              <SelectItem value="UTILITY">Utility</SelectItem>
              <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Switcher */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-32 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No templates found
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getHeaderIcon(template)}
                        <h3 className="font-semibold truncate">{template.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {template.language || 'en_US'}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleTestClick(template)}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Test
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onView?.(template)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {template.status === 'APPROVED' && onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(template)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(template)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Preview */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-xs space-y-1">
                      {template.components?.find((c: any) => c.type === 'BODY')?.text?.split('\n').slice(0, 3).map((line: string, i: number) => (
                        <p key={i} className="text-gray-900 dark:text-gray-100 truncate">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2 flex-wrap">
                      {getCategoryBadge(template.category)}
                      {getStatusBadge(template.status)}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestClick(template)}
                      className="shrink-0"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Language</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <div className="h-8 bg-gray-200 animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No templates found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getHeaderIcon(template)}
                        <span className="font-medium">{template.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(template.category)}</TableCell>
                    <TableCell>{getStatusBadge(template.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{template.language || 'en_US'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestClick(template)}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onView?.(template)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {template.status === 'APPROVED' && onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(template)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onDelete(template)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Test Modal */}
      <TemplateTestModal
        open={testModalOpen}
        onOpenChange={setTestModalOpen}
        template={selectedTemplate}
        appService={appService}
        organizationId={organizationId}
      />
    </div>
  )
}
