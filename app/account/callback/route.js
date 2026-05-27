import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile exists, if not create it
      const { data: profile } = await supabase
        .from('Profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        // New Google user — create profile as tenant by default
        await supabase.from('Profiles').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || '',
          phone: '',
          role: 'tenant',
        })
      }

      // Redirect logic
      if (redirectTo) {
        return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
      }

      const userRole = profile?.role || 'tenant'
      const destination = userRole === 'landlord' ? '/dashboard' : '/my-account'
      return NextResponse.redirect(new URL(destination, requestUrl.origin))
    }
  }

  // Something went wrong — send back to /account
  return NextResponse.redirect(new URL('/account?error=auth_failed', requestUrl.origin))
}