import { signIn } from "next-auth/react";

class Auth {
  userCache = new Map();

  createUser = async (data) => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return response.json();
    } catch (error) {
      throw error;
    }
  };

  login = async (data) => {
    try {
      const response = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  // authUser = async () => {
  //   try {
  //     if (this.userCache.has("cachedUser")) {
  //       return this.userCache.get("cachedUser");
  //     }

  //     const response = await fetch("/api/current");
  //     const user = await response.json();

  //     this.userCache.set("cachedUser", user);

  //     return user;
  //   } catch (error) {
  //     throw error;
  //   }
  // };
}

export default new Auth();
