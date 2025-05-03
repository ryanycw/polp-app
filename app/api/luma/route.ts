import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { slug } = await request.json()
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const apiKey = process.env.LUMA_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Luma API key is not configured' }, { status: 500 })
    }

    const res = await fetch(`https://public-api.lu.ma/public/v1/entity/lookup?slug=${slug}`, {
      headers: {
        accept: "application/json",
        "x-luma-api-key": apiKey,
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch event' }, { status: res.status })
    }

    const json = await res.json()
    const event = json.entity?.event

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error fetching Luma event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 