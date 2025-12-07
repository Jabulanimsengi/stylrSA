import { NextRequest, NextResponse } from 'next/server';

interface Top10Request {
  fullName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  category: string;
  serviceNeeded: string;
  styleOrLook?: string;
  budget: string;
  serviceType: 'onsite' | 'inhouse';
  location: string;
  locationCoords?: { lat: number; lng: number };
  preferredDate: string;
  preferredTime?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: Top10Request = await request.json();

    // Validate required fields
    if (!data.fullName || !data.phone || !data.category || !data.serviceNeeded || !data.budget || !data.location || !data.preferredDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format the request for admin notification
    const formattedRequest = `
🔔 NEW TOP 10 REQUEST

📋 Category: ${data.category}
👤 Name: ${data.fullName}
📱 Phone: ${data.phone}
${data.whatsapp ? `💬 WhatsApp: ${data.whatsapp}` : ''}
${data.email ? `📧 Email: ${data.email}` : ''}

💇 Service Needed: ${data.serviceNeeded}
${data.styleOrLook ? `🎨 Style/Look: ${data.styleOrLook}` : ''}
💰 Budget: R${data.budget}
🏠 Service Type: ${data.serviceType === 'onsite' ? 'Mobile (come to client)' : 'Visit Salon'}

📍 Location: ${data.location}
${data.locationCoords ? `🗺️ Coords: ${data.locationCoords.lat}, ${data.locationCoords.lng}` : ''}

📅 Preferred Date: ${data.preferredDate}
${data.preferredTime ? `⏰ Preferred Time: ${data.preferredTime}` : ''}
    `.trim();

    // Send to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_ORIGIN || '';
    
    try {
      const backendResponse = await fetch(`${backendUrl}/api/top10-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          formattedMessage: formattedRequest,
        }),
      });

      if (!backendResponse.ok) {
        console.error('Backend API error:', await backendResponse.text());
      }
    } catch (backendError) {
      // Log but don't fail - we can still notify admin via other means
      console.error('Failed to send to backend:', backendError);
    }

    // Log the request (in production, this would go to a database or notification service)
    console.log('Top 10 Request received:', formattedRequest);

    return NextResponse.json({ 
      success: true, 
      message: 'Request submitted successfully' 
    });
  } catch (error) {
    console.error('Error processing top 10 request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
