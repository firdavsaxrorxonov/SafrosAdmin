"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import type { Category } from "@/types/product"
import { useLanguage } from "@/contexts/language-context"

interface CategoryCardProps {
  category: Category
  productCount: number
  onEdit: (category: Category) => void
  onDelete: (id: number) => void
  onViewProducts: (category: Category) => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const { t } = useLanguage()

  return (
    <Card
      className="group hover:shadow-md transition-shadow
      w-full max-w-[200px] sm:max-w-[220px] md:max-w-[250px]
      h-[260px] sm:h-[280px] md:h-[300px] mx-auto"
    >
      {/* 🔹 Header with smaller padding */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm sm:text-base">{category.name}</h3>
          </div>
        </div>
      </CardHeader>

      {/* 🔹 Content with smaller padding */}
      <CardContent className="p-2 space-y-3">
        {category.image && (
          <div className="rounded-md overflow-hidden bg-muted h-[90px] sm:h-[110px]">
            <img
              src={category.image || "/placeholder.svg?height=120&width=200"}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs sm:text-sm"
            onClick={() => onEdit(category)}
          >
            <Edit className="h-3 w-2 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {t("categoriyEdit")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(category.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
