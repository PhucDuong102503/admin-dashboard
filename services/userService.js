import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const getUsers = async () => {
  const res = await fetch("/api/messages/users");
  const data = await res.json();
  return data?.users || [];
};
