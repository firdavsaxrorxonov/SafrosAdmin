"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit } from "lucide-react"
import type { Product, Category } from "@/types/product"
import axios from "axios"
import { useLanguage } from "@/contexts/language-context"

interface ProductTableProps {
  products: Product[]
  onEditProduct: (product: Product) => void
  onDeleteProduct: (id: string) => void
  onUpdateProduct: (product: Product) => void
  currentPage: number
  itemsPerPage: number
  units: { id: string; name_uz: string; name_ru: string }[]
  categories: Category[]
}

export function ProductTable({
  products,
  onEditProduct,
  onDeleteProduct,
  onUpdateProduct,
  currentPage,
  itemsPerPage,
  units,
  categories,
}: ProductTableProps) {
  const { language, t } = useLanguage()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempPrice, setTempPrice] = useState<string>("")

  const getUnitName = (unityId: string) =>
    units.find((u) => u.id === unityId)
      ? language === "uz"
        ? units.find((u) => u.id === unityId)!.name_uz
        : units.find((u) => u.id === unityId)!.name_ru
      : "—"

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)
      ? language === "uz"
        ? categories.find((c) => c.id === categoryId)!.nameUz
        : categories.find((c) => c.id === categoryId)!.nameRu
      : "—"

  const handleDoubleClick = (product: Product) => {
    setEditingId(product.id)
    setTempPrice(product.price.toString())
  }

  const handlePriceUpdate = async (product: Product) => {
    if (tempPrice.trim() === "" || isNaN(Number(tempPrice))) return

    try {
      const token = localStorage.getItem("agroAdminToken")
      const fd = new FormData()
      fd.append("name", product.name)
      fd.append("price", tempPrice)
      fd.append("category", product.category)
      fd.append("unity", product.unity)
      fd.append("quantity_left", product.quantity_left?.toString() || "")

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/${product.id}/update/`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
            "Accept-Language": language,
          },
        }
      )

      // ✅ faqat shu productni parent-ga qaytarib yangilash
      onUpdateProduct({ ...product, price: tempPrice })

      setEditingId(null)
    } catch (err) {
      console.error(err)
      alert(t("Error") + ": " + t("Failed to fetch suppliers"))
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>№</TableHead>
              <TableHead>{t("Name")}</TableHead>
              <TableHead>{t("Price")}</TableHead>
              <TableHead>{t("Category")}</TableHead>
              <TableHead>{t("Unit")}</TableHead>
              <TableHead>{t("quantity_Left")}</TableHead>
              <TableHead>{t("min_quantity")}</TableHead>
              <TableHead>{t("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <TableRow key={product.order_number}>
                <TableCell className="font-medium">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell>{product.name_uz}</TableCell>
                <TableCell>{product.name_ru}</TableCell>

                {/* Inline price edit */}
                <TableCell
                  onDoubleClick={() => handleDoubleClick(product)}
                  className="cursor-pointer"
                >
                  {editingId === product.id ? (
                    <input
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      onBlur={() => handlePriceUpdate(product)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handlePriceUpdate(product)
                        }
                        if (e.key === "Escape") setEditingId(null)
                      }}
                      autoFocus
                      className="w-20 border rounded px-1"
                    />
                  ) : (
                    product.price
                  )} UZS
                </TableCell>

                <TableCell>{getCategoryName(product.category)}</TableCell>
                <TableCell>{getUnitName(product.unity)}</TableCell>
                <TableCell>{product.quantity_left || "—"}</TableCell>
                <TableCell>{product.min_quantity || "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onEditProduct(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
