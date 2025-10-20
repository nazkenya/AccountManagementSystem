import api from "../api/client";

export const getUsers = async () => {
  try {
    const res = await api.get("/users");
    return res.data;
  } catch (err) {
    console.error("Gagal mengambil data user:", err);
    throw err;
  }
};
