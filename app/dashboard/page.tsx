"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout/layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { StatCard } from "@/components/dashboard/stat-card"
import { Package, Users, ShoppingCart, DollarSign } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import axios from "axios"

interface DashboardStats {
  products: number
  users: number
  orders: number
  total_price: { total_price: number }
  categories: number
}

export default function DashboardPage() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const token = typeof window !== "undefined" ? localStorage.getItem("agroAdminToken") : null
  const api = axios.create({ baseURL })
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`

  const fetchStats = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/dashboard/statistics/")
      if (data.status === "success") {
        setStats(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Title & Welcome Text */}
          <div>
            <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t("totalProducts")}
              value={loading ? "..." : stats?.products.toLocaleString() ?? "0"}
              description={t("activeProducts")}
              icon={Package}
            />
            <StatCard
              title={t("totalUsers")}
              value={loading ? "..." : stats?.users.toLocaleString() ?? "0"}
              description={t("registeredUsers")}
              icon={Users}
            />
            <StatCard
              title={t("totalOrders")}
              value={loading ? "..." : stats?.orders.toLocaleString() ?? "0"}
              description={t("ordersThisMonth")}
              icon={ShoppingCart}
            />
            <StatCard
              title={t("categories")}
              value={loading ? "..." : stats?.categories.toLocaleString() ?? "0"}
              description={t("productCategories")}
              icon={Package}
            />
          </div>
        </div>

      </Layout>
    </ProtectedRoute>
  )
}
