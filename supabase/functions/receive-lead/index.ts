import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// TODO: rate limiting — endpoint público sem proteção contra flood.
// Implementar quando houver volume real (ex: Upstash Redis ou Supabase rate limit middleware).

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const VALID_ORIGINS = ['anuncio', 'lp', 'organico', 'indicacao', 'whatsapp_meta']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  let body: { name?: string; phone?: string; studio_id?: string; origin?: string; notes?: string }

  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const { name, phone, studio_id, origin = 'whatsapp_meta', notes = '' } = body

  if (!name || !phone || !studio_id) {
    return new Response(
      JSON.stringify({ error: 'name, phone e studio_id são obrigatórios' }),
      { status: 422, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }

  if (!VALID_ORIGINS.includes(origin)) {
    return new Response(
      JSON.stringify({ error: 'origin inválido' }),
      { status: 422, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', studio_id)
    .maybeSingle()

  if (!profile) {
    return new Response(
      JSON.stringify({ error: 'studio_id inválido' }),
      { status: 422, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }

  const { data, error } = await supabase
    .from('leads')
    .insert({ name, phone, studio_id, origin, stage: 'novo', notes })
    .select('id')
    .single()

  if (error) {
    console.error('leads insert error:', error.message)
    return new Response(JSON.stringify({ error: 'Erro ao salvar lead' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ id: data.id }), {
    status: 201,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
})
