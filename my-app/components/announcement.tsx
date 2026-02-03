import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import Link from "next/link";

export const AnnouncementBanner = () => {
    return (
        <><div className="flex justify-center"></div><Link href="https://cal.com/intelli-demo/30min" target="_blank" rel="noopener noreferrer">
            <div className="border indigo-600 shadow-sm bg-indigo-200 backdrop-blur-sm rounded-xl px-4 py-1.5 flex items-center space-x-2 cursor-pointer hover:bg-indigo-300 transition-colors">
                <Badge variant="default" className="bg-white text-black text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" /> 
                </Badge>
                <span className="text-white text-xs"><strong>Talk to our Team</strong>
                    <br />
                    <span className="font-normal">30 min call</span>
                </span>
            </div>
        </Link></>
    );
};