import { createClient } from "npm:@supabase/supabase-js@2.115.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationPayload {
  type: "booking" | "contact" | "quote";
  // For bookings
  workTitle?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  bookingMessage?: string;
  // For contact & quotes
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  // For quotes
  projectType?: string;
  budgetRange?: string;
  description?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the contact email from site_settings
    const { data: settings, error: settingsError } = await supabase
      .from("site_settings")
      .select("contact_email, site_name")
      .eq("id", 1)
      .maybeSingle();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: "Could not fetch site settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: NotificationPayload = await req.json();
    const recipientEmail = settings.contact_email;
    const siteName = settings.site_name || "3A Furniture Workshop";

    let emailSubject: string;
    let emailBody: string;

    if (payload.type === "booking") {
      emailSubject = `New Booking Request: ${payload.workTitle || "Furniture Piece"}`;
      emailBody = [
        `You have received a new booking request on your ${siteName} website.`,
        "",
        `Item: ${payload.workTitle || "N/A"}`,
        `Customer Name: ${payload.customerName || "N/A"}`,
        `Customer Email: ${payload.customerEmail || "N/A"}`,
        `Customer Phone: ${payload.customerPhone || "N/A"}`,
        "",
        "Message:",
        payload.bookingMessage || "(No message provided)",
        "",
        `You can reply directly to the customer at ${payload.customerEmail}.`,
        `You can also view and manage this booking in your admin panel.`,
      ].join("\n");
    } else if (payload.type === "quote") {
      emailSubject = `New Quote Request: ${payload.projectType || "Custom Project"}`;
      emailBody = [
        `You have received a new quote request on your ${siteName} website.`,
        "",
        `Name: ${payload.name || "N/A"}`,
        `Email: ${payload.email || "N/A"}`,
        `Phone: ${payload.phone || "N/A"}`,
        `Project Type: ${payload.projectType || "N/A"}`,
        `Budget Range: ${payload.budgetRange || "N/A"}`,
        "",
        "Project Description:",
        payload.description || "(No description provided)",
        "",
        `You can reply directly to ${payload.name} at ${payload.email}.`,
        `You can also view and manage this quote in your admin panel.`,
      ].join("\n");
    } else {
      emailSubject = `New Contact Message: ${payload.subject || "General Enquiry"}`;
      emailBody = [
        `You have received a new contact message on your ${siteName} website.`,
        "",
        `Name: ${payload.name || "N/A"}`,
        `Email: ${payload.email || "N/A"}`,
        `Phone: ${payload.phone || "N/A"}`,
        `Subject: ${payload.subject || "N/A"}`,
        "",
        "Message:",
        payload.message || "(No message provided)",
        "",
        `You can reply directly to ${payload.name} at ${payload.email}.`,
        `You can also view this message in your admin panel.`,
      ].join("\n");
    }

    // Try to send email via Resend if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey) {
      const replyTo = payload.type === "booking"
        ? payload.customerEmail
        : payload.email;

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${siteName} <onboarding@resend.dev>`,
          to: [recipientEmail],
          reply_to: replyTo || undefined,
          subject: emailSubject,
          text: emailBody,
        }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        console.error("Resend API error:", errText);
        // Still return success — the message is saved in the database
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification processed",
        emailSent: !!resendApiKey,
        recipient: recipientEmail,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in send-notification:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
