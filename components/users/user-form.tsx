"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import axios from "axios"
import type { User } from "@/types/order"
import { useLanguage } from "@/contexts/language-context"

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userData: Omit<User, "id" | "date_joined" | "last_login"> & { role: string; password?: string; is_superuser: boolean }) => void
  editingUser?: User | null
}

export function UserForm({ isOpen, onClose, onSubmit, editingUser }: UserFormProps) {
  const { t } = useLanguage()

  const initialRole = editingUser?.role || "user"
  const initialIsSuperuser = initialRole === "admin"

  const [formData, setFormData] = useState({
    first_name: editingUser?.first_name || "",
    last_name: editingUser?.last_name || "",
    username: editingUser?.username || "",
    password: "",
    role: initialRole,
    is_superuser: initialIsSuperuser,
  })

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const token = typeof window !== "undefined" ? localStorage.getItem("agroAdminToken") : null
  const api = axios.create({ baseURL })
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`

  useEffect(() => {
    const role = editingUser?.role || "user"
    setFormData({
      first_name: editingUser?.first_name || "",
      last_name: editingUser?.last_name || "",
      username: editingUser?.username || "",
      password: "",
      role: role,
      is_superuser: role === "admin",
    })
  }, [editingUser])

  const handleRoleChange = (val: string) => {
    setFormData({
      ...formData,
      role: val,
      is_superuser: val === "admin",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username || (!editingUser && !formData.password)) {
      alert(t("Please fill all required fields"))
      return
    }

    const payload: any = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      username: formData.username,
      role: formData.role,
      is_superuser: formData.is_superuser,
    }

    if (!editingUser || formData.password) {
      payload.password = formData.password
    }

    try {
      if (editingUser) {
        await api.patch(`/user/${editingUser.id}/update/`, payload)
      } else {
        payload.last_login = new Date().toISOString()
        payload.date_joined = new Date().toISOString()
        await api.post("/user/create/", payload)
      }

      onSubmit(payload)
      setFormData({ first_name: "", last_name: "", username: "", password: "", role: "user", is_superuser: false })
      onClose()
    } catch (error: any) {
      console.error("UserForm error:", error.response?.data || error)
      alert(
        error.response?.data?.username?.[0] ||
        error.response?.data?.password?.[0] ||
        t("Error")
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingUser ? t("edit") : t("create")}</DialogTitle>
          <DialogDescription>
            {editingUser ? t("Update the product information below.") : t("Fill in the product information below.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">{t("name")} (First)</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder={t("name")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">{t("name")} (Last)</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder={t("name")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {editingUser ? t("Password (leave empty if not changing)") : t("Password")}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? t("Leave empty to keep current password") : t("Password")}
              required={!editingUser}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t("role")}</Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{t("User")}</SelectItem>
                <SelectItem value="admin">{t("Admin")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>{t("cancel")}</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingUser ? t("update") : t("create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
