// composables/useAuth.js
export function useAuth() {
  const token = useCookie("auth_token", { path: "/", maxAge: 60 * 15 }); // 15 mins
  const refreshToken = useCookie("refresh_token", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  }); // optional
  const user = useState("user", () => null);

  const login = async (identifier, password) => {
    try {
      const res = await $fetch("http://localhost:8055/auth/login/ldap", {
        method: "POST",
        body: { identifier, password},
        headers: {
          "Content-Type": "application/json",
        },
      });
      token.value = res.data.access_token;
      refreshToken.value = res.data.refresh_token;
        // console.log('Sending token:', token.value)


      // 🔥 NOW fetch the user:
      const userRes = await $fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });

      user.value = userRes;
      // console.log("User data:", user.value);

      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        message: err.data?.errors?.[0]?.message || "Erreur inconnue",
      };
    }
  };

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
