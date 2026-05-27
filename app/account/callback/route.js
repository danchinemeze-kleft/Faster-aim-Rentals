import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from('Profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        await supabase.from('Profiles').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || '',
          phone: '',
          role: 'tenant',
        })
      }

      if (redirectTo) {
        return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
      }

      const userRole = profile?.role || 'tenant'
      const destination = userRole === 'landlord' ? '/dashboard' : '/my-account'
      return NextResponse.redirect(new URL(destination, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/account?error=auth_failed', requestUrl.origin))
}