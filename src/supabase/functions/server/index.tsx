import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'], 
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Helper function to verify user
async function verifyUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  return error ? null : user;
}

// Auth Routes
app.post('/make-server-0a04762c/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }

    return c.json({ user: data.user })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// Trip Routes
app.get('/make-server-0a04762c/trips/:userId', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('userId')
    const trips = await kv.getByPrefix(`trips:${userId}`)
    return c.json({ trips })
  } catch (error) {
    console.log('Get trips error:', error)
    return c.json({ error: 'Failed to fetch trips' }, 500)
  }
})

app.post('/make-server-0a04762c/trips', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const tripData = await c.req.json()
    const tripId = `trips:${user.id}:${Date.now()}`
    
    await kv.set(tripId, {
      ...tripData,
      userId: user.id,
      createdAt: new Date().toISOString()
    })

    return c.json({ success: true, tripId })
  } catch (error) {
    console.log('Save trip error:', error)
    return c.json({ error: 'Failed to save trip' }, 500)
  }
})

// Booking Routes
app.post('/make-server-0a04762c/bookings', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookingData = await c.req.json()
    const bookingId = `bookings:${user.id}:${Date.now()}`
    
    await kv.set(bookingId, {
      ...bookingData,
      userId: user.id,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    })

    return c.json({ success: true, bookingId, status: 'confirmed' })
  } catch (error) {
    console.log('Save booking error:', error)
    return c.json({ error: 'Failed to save booking' }, 500)
  }
})

app.get('/make-server-0a04762c/bookings/:userId', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('userId')
    const bookings = await kv.getByPrefix(`bookings:${userId}`)
    return c.json({ bookings })
  } catch (error) {
    console.log('Get bookings error:', error)
    return c.json({ error: 'Failed to fetch bookings' }, 500)
  }
})

// Chat Routes
app.post('/make-server-0a04762c/chat/messages', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { message, roomId } = await c.req.json()
    const messageId = `chat:${roomId}:${Date.now()}`
    
    const messageData = {
      id: messageId,
      message,
      roomId,
      userId: user.id,
      userName: user.user_metadata?.name || user.email,
      timestamp: new Date().toISOString()
    }
    
    await kv.set(messageId, messageData)
    return c.json({ message: messageData })
  } catch (error) {
    console.log('Save chat message error:', error)
    return c.json({ error: 'Failed to save message' }, 500)
  }
})

app.get('/make-server-0a04762c/chat/messages/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId')
    const messages = await kv.getByPrefix(`chat:${roomId}`)
    
    // Sort messages by timestamp
    const sortedMessages = messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    
    return c.json({ messages: sortedMessages })
  } catch (error) {
    console.log('Get chat messages error:', error)
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

// AI Assistant Route (mock for now)
app.post('/make-server-0a04762c/ai/suggestions', async (c) => {
  try {
    const { preferences, budget, duration } = await c.req.json()
    
    // Mock AI suggestions based on preferences
    const mockSuggestions = [
      {
        destination: "Bali, Indonesia",
        reason: "Perfect for relaxation with beautiful beaches and temples",
        estimatedCost: budget * 0.8,
        activities: ["Beach surfing", "Temple visits", "Spa treatments"]
      },
      {
        destination: "Tokyo, Japan", 
        reason: "Great mix of modern culture and traditional experiences",
        estimatedCost: budget * 1.1,
        activities: ["Sushi experiences", "Temple visits", "Shopping districts"]
      },
      {
        destination: "Swiss Alps",
        reason: "Beautiful mountain scenery perfect for adventure",
        estimatedCost: budget * 1.2,
        activities: ["Hiking", "Cable car rides", "Mountain lodges"]
      }
    ]
    
    return c.json({ suggestions: mockSuggestions })
  } catch (error) {
    console.log('AI suggestions error:', error)
    return c.json({ error: 'Failed to generate suggestions' }, 500)
  }
})

serve(app.fetch)