 export const API = async (url: string, method = "GET", body?: any) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:3000/api${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
};