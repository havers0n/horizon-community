import { supabase } from '@/lib/supabase'

export const apiRequestWithAuth = async (
  method: string, 
  url: string, 
  body?: any
) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response
}
