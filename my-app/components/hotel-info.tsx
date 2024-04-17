"use client"
import React, { useState } from 'react';
import FileUploadPopup from '@/components/fileUpload';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
Paperclip,
Upload,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BaseSyntheticEvent } from "react";
import {
  FormState,
  FieldValues,
  FieldError,
  ErrorOption,
  SubmitHandler,
  SubmitErrorHandler,
  FieldArrayPath,
  FieldArray,
  FieldErrors,
  Field,
  RegisterOptions,
  UseFormRegisterReturn,
} from "react-hook-form";

 
const items = [
  {
    id: "recents",
    label: "Free Parking",
  },
  {
    id: "home",
    label: "Gym and Fitness",
  },
  {
    id: "applications",
    label: "Sauna and Steam",
  },
  {
    id: "desktop",
    label: "Room Amenities",
  },
  {
    id: "downloads",
    label: "Free Wi-fi and Cable TV",
  },
  {
    id: "documents",
    label: "Toiletries",
  },
  {
    id: "swimming",
    label: "Swimming Pool",
  },
] as const

const FormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You can select as many as possible.",
  }),
})
 

export default function HotelInfo() {

  const [showPopup, setShowPopup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleUpload = (files: File[]) => {
    setUploadedFiles(files);
   
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: ["recents", "home"],
    },
  })
 
  function onSubmit(data: z.infer<typeof FormSchema>) {
    const formData = {
      ...data,
      uploadedFiles,
    };
  
    // Here, you can send the formData object to your server or perform any other necessary operations
    console.log(formData);
  
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(formData, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Card className="p-10 ">
    <div className="mx-auto grid gap-4 pb-10" >
    <Card className="pt-2">
    <CardHeader>
    <CardTitle>Hotel Info</CardTitle>
    </CardHeader>    
    <CardContent>
    Add details about your hotel here. Click Save when you are done.
    </CardContent>
  </Card>
    </div>
      
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
    <div className="grid gap-6">
              <div className="grid gap-3 col-2">
                <Label htmlFor="name">Contact Info</Label>
                <Input
                  id="name"
                  type="text"
                  className="w-full"
                  defaultValue=""
                  placeholder="Phone Number"
                />
                <Input
                  id="name"
                  type="text"
                  className="w-full"
                  defaultValue=""
                  placeholder="Email Address"
                />
                <Input
                  id="name"
                  type="text"
                  className="w-full"
                  defaultValue=""
                  placeholder="Address"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Number of Rooms/Capacity </Label>
                <Input
                  id="name"
                  type="text"
                  className="w-full"
                  defaultValue=""
                  placeholder="Number of Rooms"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Rack Rate</Label>
                <Input
                  id="name"
                  type="text"
                  className="w-full"
                  defaultValue=""
                  placeholder="Rack Rate"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Room types</Label>
                <Input
                  id="name"
                  type="text"
                  className="w-full"
                  placeholder="room types"
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="description">Amenities</Label>
                <Textarea
                  id="description"
                  defaultValue=""
                  className="min-h-32"
                  placeholder="Type all the amenities here..."
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Refund Policy</Label>
                <Input
                  id="name"
                  type="text"
                  className="w-full"
                  placeholder="refund policy"
                />
                
              </div>
              <FormField
        control={form.control}
        name="items"
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel className="text-base">Facilities</FormLabel>
              <FormDescription>
              Select all the amenities your facility provides
              </FormDescription>
            </div>
            {items.map((item) => (
              <FormField
                key={item.id}
                control={form.control}
                name="items"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={item.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, item.id])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== item.id
                                  )
                                )
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {item.label}
                      </FormLabel>
                    </FormItem>
                  )
                }}
              />
            ))}
            <FormMessage />
          </FormItem>
        )}
      />


              <div className="grid gap-3">
                <Label htmlFor="name">Discounts/Promos</Label>
                <Input
                  id="name"
                  type="text"
                  className="w-full"
                  placeholder="Add discounts"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Exceptions</Label>
                <Input
                  id="name"
                  type="text"
                  className="w-full"
                  placeholder="exceptions"
                />
              </div>
      <Label htmlFor="message" className="sr-only">
        Upload Policies
      </Label>
      <div className="flex items-center p-3 pt-0 border-blue">
      <Button
        type="button"
        onClick={() => setShowPopup(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
      >
        Upload Documents
        <Upload className="ml-2" size={16} />
      </Button>

      {showPopup && (
        <FileUploadPopup
          onClose={() => setShowPopup(false)}
          onFilesUploaded={handleUpload}
        />
      )}
    </div>
    </div>
      <Button type="submit">Save Hotel Details</Button>
    </form>
  </Form>
  </Card>


  );
}
