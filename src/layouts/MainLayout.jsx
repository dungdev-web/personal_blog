import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import BackToTop from "../components/BackToTop"

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname])
  return null
}

export default function MainLayout() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-white">
      {/* vệt màu chàm rất nhạt phía trên, giống ảnh mẫu */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(60%_70%_at_50%_0%,rgba(99,102,241,0.12),transparent_72%)]"
      />
      <ScrollToTop />
      <Header />
      <main className="relative">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
