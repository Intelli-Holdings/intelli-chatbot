import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    associatedApplications: [
      {
        applicationId: "5a2c9ce9-a423-49ca-9445-dd5165ec7455",
      },
    ],
  })
}
