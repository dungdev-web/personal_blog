import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useEffect, useState } from "react";
import MarkdownRenderer from "../components/MarkdownRenderer";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // 1. Load bài hiện tại
      const snap = await getDoc(doc(db, "posts", id));
      if (!snap.exists()) return;

      const currentPost = { id: snap.id, ...snap.data() };
      setPost(currentPost);

      // 2. Load bài liên quan theo category
      const q = query(
        collection(db, "posts"),
        where("category", "==", currentPost.category),
        limit(5)
      );

      const rs = await getDocs(q);

      const items = rs.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.id !== currentPost.id) // bỏ chính nó
        .slice(0, 4);

      setRelated(items);
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) return "Loading...";

  if (!post) return "Not found";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* MAIN CONTENT */}
      <article className="lg:col-span-3 bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <div className="text-sm text-gray-500 mb-6">
          {post.category} • {post.date?.toDate().toLocaleDateString("vi-VN")}
        </div>

        <MarkdownRenderer content={post.content} />
      </article>

      {/* SIDEBAR */}
      <aside className="lg:col-span-1">
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-4">Bài viết liên quan</h3>

          {related.length === 0 && (
            <p className="text-sm text-gray-500">Chưa có bài liên quan</p>
          )}

          <ul className="space-y-3">
            {related.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/post/${p.id}`}
                  className="block hover:text-blue-600 transition"
                >
                  <div className="text-sm font-medium line-clamp-2">
                    {p.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    {p.date?.toDate().toLocaleDateString("vi-VN")}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
