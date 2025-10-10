"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Edit, Trash2, Clock } from "lucide-react"
import type { User } from "@/types/order"
import { useLanguage } from "@/contexts/language-context"


interface UserCardProps {
  user: User
  onEdit: (user: User) => void
  onDelete: (id: number) => void
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const { t } = useLanguage()

  const getRoleColor = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "moderator":
        return "bg-blue-100 text-blue-800"
      case "user":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-green-100 text-green-700">
                {user.username
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{user.username}</h3>
              <p className="text-sm text-muted-foreground">{user.email || t("noEmail")}</p>
            </div>
          </div>
          <Badge className={getRoleColor(user.role)}>
            {user.role === "admin" ? t("Admin") : user.role === "user" ? t("User") : user.role}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {t("Joined")} {new Date(user.date_joined).toLocaleDateString()}
          </span>
        </div>

        {user.lastLogin && (
          <div className="text-sm text-muted-foreground">
            {t("Last login")}: {new Date(user.lastLogin).toLocaleDateString()}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(user)} className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            {t("edit")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(user.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
