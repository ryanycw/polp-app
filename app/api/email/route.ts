import { NextResponse } from "next/server";
import { auth, signOut } from "@/auth";

export async function GET(req: Request) {
  // Get the session (and thus the access token)
  const session = await auth();
  const accessToken = (session as any).accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated. Please sign in again." }, { status: 401 });
  }

  // Get event name from query params
  const { searchParams } = new URL(req.url);
  const eventName = searchParams.get("eventName") || "";
  const pageToken = searchParams.get("pageToken") || "";

  // Build the Gmail API request
  const query = `from:calendar.luma-mail.com subject:(\"${eventName}\")`;
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}${pageToken ? `&pageToken=${pageToken}` : ""}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  // If the token is invalid or expired, clean up and ask user to sign in again
  if (listRes.status === 401) {
    // Optionally, you can clear cookies or session here if needed
    // For Auth.js, you may want to trigger signOut on the client after this response
    return NextResponse.json({ error: "Session expired or invalid. Please sign in again." }, { status: 401 });
  }

  const listData = await listRes.json();
  const nextPageToken = listData.nextPageToken || null;
  if (!listData.messages) return NextResponse.json({ emails: [] });

  // Fetch details for each message (limit to 10 for demo)
  const emails = await Promise.all(
    listData.messages.slice(0, 10).map(async (msg: any) => {
      // First get the metadata
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=subject&metadataHeaders=date`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const msgData = await msgRes.json();
      const headers = msgData.payload.headers;
      const subject = headers.find((h: any) => h.name === "Subject")?.value || "";
      const date = headers.find((h: any) => h.name === "Date")?.value || "";

      // Then get the raw email data
      const rawRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=raw`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const rawData = await rawRes.json();
      
      // Convert base64url to base64 and then to string
      const raw = rawData.raw
        ? Buffer.from(rawData.raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
        : null;

      return {
        id: msg.id,
        subject,
        date,
        raw,
      };
    })
  );

  return NextResponse.json({ emails, nextPageToken });
}
