import { supabase } from '../config/supabaseClient.js'

export async function listUsers(request, response) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email')
    .neq('id', request.user.id)
    .order('name')

  if (error) {
    return response.status(500).json({ message: error.message })
  }

  response.json({ users: data })
}
