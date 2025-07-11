import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, userId } = await request.json();
    
    const organization = await clerkClient.organizations.createOrganization({
      name,
      createdBy: userId,
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Failed to create organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
