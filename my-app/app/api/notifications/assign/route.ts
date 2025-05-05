import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
  try {
    const { notification_id, user_email, user_name } = await request.json();
    if (!notification_id || !user_email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update notification in DB
    const notification = await prisma.notification.update({
      where: { id: notification_id },
      data: { assignee: user_email },
    });

    // Send email via Resend
    await resend.emails.send({
      from: "Support <support@intelliconcierge.com>",
      to: [user_email],
      subject: "You have been assigned a new ticket",
      html: `
        <p>Hi ${user_name || "there"},</p>
        <p>You have been assigned a new ticket/escalation. Please log in to the dashboard to view and resolve it.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications" style="background: #2563eb; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Go to Dashboard</a></p>
        <p>Thank you!</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to assign notification or send email:", error);
    return NextResponse.json({ error: "Failed to assign notification or send email" }, { status: 500 });
  }
} 