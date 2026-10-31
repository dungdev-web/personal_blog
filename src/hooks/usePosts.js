import {
  collection, getDocs, limit, orderBy, query, startAfter, where,
} from "firebase/firestore"
import { db } from "../firebase/firebase"
import { useCallback, useEffect, useRef, useState } from "react"

const PAGE_SIZE = 12

// Phân trang: mỗi lần chỉ đọc PAGE_SIZE bài, để số lượt đọc Firestore
// không tăng theo số bài mà bot đăng mỗi ngày.
export function usePosts(category = "all", pageSize = PAGE_SIZE) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState(null)
  const cursor = useRef(null)
  const generation = useRef(0)

  const build = useCallback(
    (after) => {
      const c = [where("status", "==", "published")]
      if (category && category !== "all") c.push(where("category", "==", category))
      c.push(orderBy("date", "desc"))
      if (after) c.push(startAfter(after))
      c.push(limit(pageSize))
      return query(collection(db, "posts"), ...c)
    },
    [category, pageSize],
  )

  useEffect(() => {
    const gen = ++generation.current
    cursor.current = null
    setLoading(true)
    setError(null)

    getDocs(build(null))
      .then((snap) => {
        if (gen !== generation.current) return
        cursor.current = snap.docs.at(-1) ?? null
        setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setHasMore(snap.docs.length === pageSize)
      })
      .catch((e) => {
        if (gen !== generation.current) return
        console.error(e)
        setError(e)
        setPosts([])
        setHasMore(false)
      })
      .finally(() => {
        if (gen === generation.current) setLoading(false)
      })
  }, [build, pageSize])

  const loadMore = useCallback(async () => {
    if (!cursor.current || loadingMore) return
    const gen = generation.current
    setLoadingMore(true)
    try {
      const snap = await getDocs(build(cursor.current))
      if (gen !== generation.current) return
      cursor.current = snap.docs.at(-1) ?? cursor.current
      setPosts((prev) => [...prev, ...snap.docs.map((d) => ({ id: d.id, ...d.data() }))])
      setHasMore(snap.docs.length === pageSize)
    } catch (e) {
      console.error(e)
      setError(e)
    } finally {
      setLoadingMore(false)
    }
  }, [build, loadingMore, pageSize])

  return { posts, loading, loadingMore, hasMore, loadMore, error }
}
