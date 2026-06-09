const ADMIN_EMAIL = 'daniel@fasteraim.com' // replace with your actual email

useEffect(() => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/account?redirect=/list')
      return
    }
    setUser(session.user)
    fetchListings(session.user.id)
  }
  checkAuth()
}, [])