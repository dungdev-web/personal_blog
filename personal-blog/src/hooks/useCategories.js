import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase/firebase"

export async function fetchCategories() {
  const snap = await getDocs(collection(db, "categories"))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
