import { collection, getDocs, orderBy, query, where } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useEffect, useState } from "react"

export function usePosts(category = "all") {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      let q

      if (category && category !== "all") {
        q = query(
          collection(db, "posts"),
          where("category", "==", category),
          orderBy("date", "desc")
        )
      } else {
        q = query(
          collection(db, "posts"),
          orderBy("date", "desc")
        )
      }

      const snap = await getDocs(q)
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }

    load()
  }, [category])

  return { posts, loading }
}
