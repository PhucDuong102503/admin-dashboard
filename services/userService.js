import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// Lấy danh sách người dùng có role là "user"
export const getUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((user) => user.role === "user");
};