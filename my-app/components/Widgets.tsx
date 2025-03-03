"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useOrganizationList } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader, ExternalLink, Pen, Eye, EyeOff, ScanBarcodeIcon, Loader2, Bot, PlusCircle } from "lucide-react";
import { DeploymentDialog } from "@/components/deployment-dialog";
import { formatDate } from "@/utils/date";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface Widget {
  showKey: any;
  id: string;
  widget_name: string;
  widget_key: string;
  website_url: string;
  created_at: string;
  updated_at: string;
  organization: string;
  assistant: {
    id: string;
    name: string;
    assistant_id: string;
    prompt: string;
    created_at: string;
    updated_at: string;
  };
  organization_id: string;
  avatar_url: string;
  brand_color: string;
}

const Widgets = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [selectedWidget, setSelectedWidget] = useState<{
    key: string;
    url: string;
  } | null>(null);
  const [editWidget, setEditWidget] = useState<Widget | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState<string>("");

  const router = useRouter();

  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  useEffect(() => {
    if (isLoaded && userMemberships.data.length > 0) {
      setSelectedOrganizationId(userMemberships.data[0].organization.id);
    }
  }, [isLoaded, userMemberships.data]);

  useEffect(() => {
    if (selectedOrganizationId) {
      fetchWidgets(selectedOrganizationId);
    }
  }, [selectedOrganizationId]);

  const fetchWidgets = async (orgId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/widgets/organization/${orgId}/all/`
      );
      if (!response.ok) throw new Error("Failed to fetch widgets");
      const data = await response.json();
      setWidgets(data);
    } catch (error) {
      console.error("Error fetching widgets:", error);
      toast.error("Failed to fetch widgets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditWidget = (widget: Widget) => {
    setEditWidget(widget);
    setIsEditDialogOpen(true);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setAvatarFile(file); // Store the actual file
      // Create a preview URL for the UI
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWidget) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("organization_id", editWidget.organization_id);
    formData.append("assistant_id", editWidget.assistant.id);
    formData.append("widget_name", editWidget.widget_name);
    formData.append("website_url", editWidget.website_url);
    formData.append("brand_color", brandColor);

    if (avatarFile) {
      formData.append("avatar_url", avatarFile);
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/widgets/widget/${editWidget.widget_key}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to update widget");

      toast.success("Widget updated successfully!");
      fetchWidgets(selectedOrganizationId); // Refresh the widget list
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating widget:", error);
      toast.error("Failed to update widget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWidget = () => {
    router.push("/dashboard/playground");
  };

  return (
    <div className="space-y-4">
      <div className="">
        <label className="block text-sm font-medium text-foreground mb-1">
          Organization
        </label>
        {userMemberships &&
          userMemberships.data &&
          userMemberships.data.length > 1 && (
            <div className="w-64">
              <Select
                value={selectedOrganizationId}
                onValueChange={setSelectedOrganizationId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {userMemberships?.data?.map((membership) => (
                      <SelectItem
                        key={membership.organization.id}
                        value={membership.organization.id}
                      >
                        {membership.organization.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Widget Card */}
          <Card 
            className="h-[240px] border-dashed border-2 bg-muted hover:bg-accent/50 cursor-pointer flex items-center justify-center"
            onClick={handleCreateWidget}
          >
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <PlusCircle className="h-8 w-8 mb-2" />
              <p className="font-medium">Create Widget</p>
            </div>
          </Card>

          {/* Existing Widgets */}
          {widgets?.map((widget) => (
            <Card key={widget.id} className="h-[240px] flex flex-col">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle>{widget.widget_name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-muted-foreground">Website:</p>
                  <a
                    href={widget.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {widget.website_url.length > 25 
                      ? widget.website_url.substring(0, 25) + '...' 
                      : widget.website_url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Widget Key:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-100 p-1 rounded break-all">
                      {widget.showKey ? widget.widget_key : widget.widget_key.slice(0, 10) + "..."}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWidgets(widgets.map(w => 
                          w.id === widget.id ? { ...w, showKey: !w.showKey } : w
                        ))
                      }}
                    >
                      {widget.showKey ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created: {formatDate(widget.created_at)}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWidget({
                    key: widget.widget_key,
                    url: widget.website_url
                  })}
                >
                  Deploy Instructions
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {widgets.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">
            No widgets found for this organization.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Create a widget to get started.
          </p>
        </div>
      )}

      {selectedWidget && (
        <DeploymentDialog
          widgetKey={selectedWidget.key}
          websiteUrl={selectedWidget.url}
          onClose={() => setSelectedWidget(null)}
        />
      )}

      {editWidget && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Widget</DialogTitle>
            <DialogDescription>
              Update the details of the widget.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateWidget} style={{ maxWidth: "24rem"}} className="space-y-4">
            <div>
              <Label htmlFor="widget_name">Widget Name</Label>
              <Input
                id="widget_name"
                value={editWidget.widget_name}
                onChange={(e) =>
                  setEditWidget({ ...editWidget, widget_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                value={editWidget.website_url}
                onChange={(e) =>
                  setEditWidget({ ...editWidget, website_url: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="brand_color">Brand Color</Label>
              <Input
                id="brand_color"
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="avatar_url">Avatar</Label>
              <Input
                id="avatar_url"
                type="file"
                accept="image/jpeg, image/png"
                onChange={handleAvatarUpload}
              />
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt="Avatar Preview"
                  className="mt-2 w-16 h-16 rounded-full"
                />
              )}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Editing...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
};

export default Widgets;