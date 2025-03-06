"use client";

import { useState } from "react";
import { useOrganizationList } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateOrganizationStep from "@/components/CreateOrganizationPopup";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InviteModal } from "./components/invite-modal";
import { useIsOrgAdmin } from "./utils/roles";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ManageOrganizations() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("created");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isAdmin = useIsOrgAdmin();

  const { isLoaded, userMemberships, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const filteredOrganizations = userMemberships?.data
    ?.filter((mem) =>
      mem.organization.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "created") {
        return (
          new Date(b.organization.createdAt).getTime() -
          new Date(a.organization.createdAt).getTime()
        );
      }
      return a.organization.name.localeCompare(b.organization.name);
    });

  const handleDeleteOrg = async (orgId: string) => {
    try {
      const membership = userMemberships?.data?.find(
        (mem) => mem.organization.id === orgId
      );
      await membership?.destroy();
      toast.success("Organization deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete organization");
      console.error(error);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Manage Organizations</h1>
        <p className="text-muted-foreground">
          Create and manage organizations, their settings and members
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by: Created" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Sort by: Created</SelectItem>
              <SelectItem value="name">Sort by: Name</SelectItem>
            </SelectContent>
          </Select>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="bg-[#007fff] text-white hover:bg-[#007fff]/100 hover:text-white"
                size={"sm"}
                variant="outline"
              >
                Create Organization
                <Building className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              
              <CreateOrganizationStep />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-blue-300 shadow-md">
        <Table className="min-w-full bg-white-100">
          <TableHeader>
            <TableRow className="bg-blue-50 border-b">
              <TableHead className="">Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrganizations?.map((mem) => (
              <TableRow
                key={mem.organization.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={async () => {
                  await setActive({ organization: mem.organization.id });
                  router.push(`/dashboard/organization/${mem.organization.id}`);
                }}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {mem.organization.imageUrl ? (
                      <img
                        src={mem.organization.imageUrl || "/placeholder.svg"}
                        alt=""
                        className="h-8 w-8 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-md bg-muted" />
                    )}
                    {mem.organization.name}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {mem.organization.id}
                </TableCell>
                <TableCell>{mem.organization.membersCount || 0}</TableCell>
                <TableCell>
                  {new Date(mem.organization.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        organizationId={selectedOrgId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              organization and remove all members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteOrg(selectedOrgId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
