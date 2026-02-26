import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

/**
 * GDPR Right to Erasure — Delete all user data.
 * DELETE /api/user/delete
 */
export async function DELETE() {
  try {
    const { userId, orgId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Cascade deletion to backend
    const response = await fetch(`${backendUrl}/api/users/${userId}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        organizationId: orgId,
        deleteConversations: true,
        deleteContacts: true,
        deleteMessages: true,
        deleteCampaigns: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error("GDPR deletion failed at backend", {
        userId,
        status: response.status,
        error: errorData,
      });
      return NextResponse.json(
        { error: "Failed to delete user data" },
        { status: 500 }
      );
    }

    logger.info("GDPR data deletion completed", { userId });

    return NextResponse.json({
      success: true,
      message: "All user data has been deleted",
    });
  } catch (error) {
    logger.error("GDPR deletion endpoint error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
