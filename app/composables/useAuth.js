// composables/useAuth.js
export function useAuth() {
  const token = useCookie("auth_token", { path: "/", maxAge: 60 * 15 }); // 15 mins
  const refreshToken = useCookie("refresh_token", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  }); // optional
  const user = useState("user", () => null);
  const { directusFetch, base } = useDirectus()

  const login = async (email, password) => {
    try {
      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      token.value = res.data.access_token
      refreshToken.value = res.data.refresh_token
      const userRes = await $fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      user.value = userRes
      return { success: true }
    } catch (err) {
      console.error('Login error:', err)
      return {
        success: false,
        message: err.statusMessage || err.data?.errors?.[0]?.message || 'Échec de connexion'
      }
    }
  }

  const logout = () => {
    token.value = null;
    user.value = null;
  };

  return {
    token,
    user,
    login,
    logout,
  };
}
