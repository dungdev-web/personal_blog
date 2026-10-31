import { useEffect, useRef, useState } from "react"

// Hiện dần khi cuộn tới (một lần). CSS .reveal xử lý cả prefers-reduced-motion.
export default function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useRef(null)
  // Trình duyệt cũ không có IntersectionObserver thì hiện luôn
  const [shown, setShown] = useState(() => typeof window !== "undefined" && !("IntersectionObserver" in window))

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!("IntersectionObserver" in window)) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      data-shown={shown}
      style={{ transitionDelay: shown ? `${delay}ms` : undefined }}
      className={`reveal ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
