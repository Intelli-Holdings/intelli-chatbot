// app/components/docs/search.tsx
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react"; // Changed to correct import

export const Search: React.FC = () => {
  return (
    <div className="relative max-w-md w-full border-white-100 border-rounded-lg ">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
      <Input
        type="search"
        placeholder="Search..."
        className="pl-10"
      />
    </div>
  );
};