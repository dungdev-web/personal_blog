import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, orderBy, query, serverTimestamp,
} from "firebase/firestore"
import { db } from "../firebase/firebase"

export async function fetchAllPosts() {
  const q = query(collection(db, "posts"), orderBy("date", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function fetchAllCategories() {
  const snap = await getDocs(collection(db, "categories"))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createPost(data) {
  return await addDoc(collection(db, "posts"), {
    ...data,
    date:      serverTimestamp(),
    createdAt: serverTimestamp(),
  })
}

export async function updatePost(id, data) {
  return await updateDoc(doc(db, "posts", id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deletePost(id) {
  return await deleteDoc(doc(db, "posts", id))
}

export function formatDate(val) {
  if (!val) return "—"
  if (val?.toDate)
    return val.toDate().toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    })
  return val
}