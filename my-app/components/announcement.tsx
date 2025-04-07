import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export const AnnouncementBanner = () => {
    return (
        <><div className="flex justify-center"></div><Link href="/dashboard/conversations/whatsapp">
            <div className="border indigo-600 shadow-sm bg-indigo-200 backdrop-blur-sm rounded-xl px-4 py-1.5 flex items-center space-x-2 cursor-pointer hover:bg-indigo-300 transition-colors">
                <Badge variant="default" className="bg-white text-black text-xs flex items-center gap-1">
                New<Sparkles className="h-3 w-3" /> 
                </Badge>
                <span className="text-white text-xs">See the all-new whatsapp chats UI</span>
            </div>
        </Link></>
    );
};