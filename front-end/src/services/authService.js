import api from "./api"


function getApiErrorMessage(error) {
  const data = error.response?.data;

  if (!data) {
    return error.message || "Unable to connect to the server.";
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  return Object.entries(data)
    .map(([field, messages]) => {
      const message = Array.isArray(messages)
        ? messages.join(" ")
        : typeof messages === "string"
          ? messages
          : JSON.stringify(messages);

      return `${field}: ${message}`;
    })
    .join("\n");
}


export async function registerUser(userData) {
  try {
    const { data } = await api.post("auth/register/", {
      username: userData.username,
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      confirm_password: userData.confirm_password,
    });

    // Your current Django registration endpoint does not return JWT tokens.
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}


export async function loginUser(credentials) {
  try {
    const { data } = await api.post("auth/login/", {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });

    // Simple JWT returns { access, refresh }.
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}




export async function getCurrentUser(accessToken) {
  try {
    const { data } = await api.get("auth/me/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
