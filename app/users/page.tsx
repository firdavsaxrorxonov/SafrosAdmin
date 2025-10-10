"use client"

import { useState, useEffect, useMemo } from "react"
import { Layout } from "@/components/layout/layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import axios from "axios"
import { UserCard } from "@/components/users/user-card"
import { UserForm } from "@/components/users/user-form"
import type { User } from "@/types/order"
import { useLanguage } from "@/contexts/language-context"


const ITEMS_PER_PAGE = 10

export default function UsersPage() {
  const { t } = useLanguage()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const token = typeof window !== "undefined" ? localStorage.getItem("agroAdminToken") : null
  const api = axios.create({ baseURL })
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/user/list/")
      const formattedUsers = data.results.map((u: User) => {
        const dateJoined = u.date_joined ? new Date(u.date_joined.split(".")[0]).toLocaleString() : ""
        return {
          ...u,
          date_joined: dateJoined,
        }
      })
      setUsers(formattedUsers)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    if (roleFilter === "all") return users
    return users.filter((u) =>
      roleFilter === "admin" ? u.is_superuser === true : u.is_superuser === false
    )
  }, [users, roleFilter])

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredUsers, currentPage])

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)

  const handleSubmitUser = async (
    userData: Omit<User, "id" | "date_joined" | "last_login"> & {
      role: string
      is_superuser: boolean
      password?: string
    }
  ) => {
    try {
      if (editingUser) {
        const payload = { ...userData }
        if (!payload.password) delete payload.password
        await api.patch(`/user/${editingUser.id}/update/`, payload)
        setEditingUser(null)
      } else {
        await api.post("/user/create/", {
          ...userData,
          last_login: new Date().toISOString(),
          date_joined: new Date().toISOString(),
        })
      }
      await fetchUsers()
      setIsFormOpen(false)
    } catch (error) {
      console.error("Failed to submit user:", error)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleDeleteUser = async (id: string) => {
    try {
      await api.delete(`/user/${id}/delete/`)
      await fetchUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingUser(null)
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t("allUsers")}</h1>
              <p className="text-muted-foreground">{t("Manage your product inventory")}</p>
            </div>
            <Button
              onClick={() => {
                setEditingUser(null)
                setIsFormOpen(true)
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" /> {t("create")}
            </Button>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">{t("Filter_by_Role")}</label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All")}</SelectItem>
                <SelectItem value="admin">{t("Admin")}</SelectItem>
                <SelectItem value="user">{t("User")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : (
            <>
              {/* Users Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={{ ...user, role: user.is_superuser ? "admin" : "user" }}
                    onEdit={handleEditUser}
                    onDelete={() => handleDeleteUser(user.id)}
                  />
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t("No users found. Add a new user to get started.")}</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={currentPage === i + 1 ? "bg-green-600 text-white" : ""}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}

              {/* User Form */}
              <UserForm
                isOpen={isFormOpen}
                onClose={handleFormClose}
                onSubmit={handleSubmitUser}
                editingUser={editingUser}
              />
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
