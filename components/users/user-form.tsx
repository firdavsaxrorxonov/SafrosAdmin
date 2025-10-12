"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { User } from "@/types/order"
import { useLanguage } from "@/contexts/language-context"

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userData: Omit<User, "id" | "date_joined" | "last_login"> & { role: string; password?: string; is_superuser: boolean; username?: string }) => void
  editingUser?: User | null
}

export function UserForm({ isOpen, onClose, onSubmit, editingUser }: UserFormProps) {
  const { t } = useLanguage()

  const initialRole = editingUser?.role || "user"
  const initialIsSuperuser = initialRole === "admin"

  const [formData, setFormData] = useState({
    username: editingUser?.username || "",
    password: "",
    role: initialRole,
    is_superuser: initialIsSuperuser,
  })

  useEffect(() => {
    const role = editingUser?.role || "user"
    setFormData({
      username: editingUser?.username || "",
      password: "",
      role,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username || (!editingUser && !formData.password)) {
      alert(t("Please fill all required fields"))
      return
    }

    const payload: any = {
      role: formData.role,
      is_superuser: formData.is_superuser,
    }

    if (!editingUser || formData.username !== editingUser.username) {
      payload.username = formData.username
    }

    if (!editingUser || formData.password) {
      payload.password = formData.password
    }

    onSubmit(payload)
    setFormData({ username: "", password: "", role: "user", is_superuser: false })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingUser ? t("edit") : t("create")}</DialogTitle>
          <DialogDescription>
            {editingUser
              ? t("Update the user information below.")
              : t("Fill in the user information below.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder={editingUser
                ? t("Leave empty to keep current password")
                : t("Enter password")}
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
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingUser ? t("update") : t("create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
