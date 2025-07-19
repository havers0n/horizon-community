import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://axgtvvcimqoyxbfvdrok.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAzMTE3MTcsImV4cCI6MjAzNTg4NzcxN30.RNqE8LJgLDqjhOjlJuWkQRcXPZP8VNxJ4YYJrfJNwwU'

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
