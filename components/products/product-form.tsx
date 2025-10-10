"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import axios from "axios"
import type { Category } from "@/types/product"
import { useLanguage } from "@/contexts/language-context"

interface Unit {
  id: string
  name: string
}

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  units: Unit[]
  editingProduct?: {
    id: string
    name: string
    price: number
    category: string
    unity: string
    description: string
    quantity_left?: number
    min_quantity?: number
  } | null
  onSuccess?: () => void
}

export function ProductForm({ isOpen, onClose, categories, units, editingProduct, onSuccess }: ProductFormProps) {
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    unity: "",
    description: "",
    quantity_left: "",
    min_quantity: "",
    imageFile: undefined as File | undefined,
  })

  const [suppliers, setSuppliers] = useState<Supplier[]>([])


  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        price: editingProduct.price.toString(),
        category: editingProduct.category || (categories[0]?.id.toString() || ""),
        unity: editingProduct.unity || (units[0]?.id || ""),
        description: editingProduct.description || "",
        quantity_left: editingProduct.quantity_left?.toString() || "",
        min_quantity: editingProduct.min_quantity?.toString() || "",
        imageFile: undefined,
      })
    } else if (units.length > 0 && categories.length > 0) {
      setFormData((prev) => ({
        ...prev,
        category: categories[0].id.toString(),
        unity: units[0].id,
      }))
    }
  }, [editingProduct, units, categories])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setFormData({ ...formData, imageFile: file })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ✅ faqat asosiy majburiy maydonlar tekshiriladi
    if (!formData.name || !formData.price || !formData.category || !formData.unity) {
      alert(t("Please fill all required fields"))
      return
    }

    const fd = new FormData()
    fd.append("name", formData.name)
    fd.append("price", formData.price.toString())
    fd.append("category", formData.category)
    fd.append("unity", formData.unity)
    fd.append("description", formData.description)
    fd.append("quantity_left", formData.quantity_left)
    fd.append("min_quantity", formData.min_quantity)

    if (formData.imageFile) fd.append("image", formData.imageFile)

    try {
      const token = localStorage.getItem("agroAdminToken")
      const url = editingProduct
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/${editingProduct.id}/update/`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/create/`

      await axios({
        method: editingProduct ? "PATCH" : "POST",
        url,
        data: fd,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error(err.response?.data || err)
      alert(t("Error") + ": " + JSON.stringify(err.response?.data || err))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingProduct ? t("update") : t("create")}</DialogTitle>
          <DialogDescription>
            {editingProduct ? t("Update the product information below.") : t("Fill in the product information below.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("Name")}</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
          </div>

          {/* Price, Quantity & Min Quantity */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{t("Price")}</Label>
              <Input
                type="number"
                step="any"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value.replace(",", ".") })
                }
              />
            </div>
            <div>
              <Label>{t("quantity_Left")}</Label>
              <Input
                type="number"
                step="any"
                value={formData.quantity_left}
                onChange={(e) =>
                  setFormData({ ...formData, quantity_left: e.target.value.replace(",", ".") })
                }
              />
            </div>
            <div>
              <Label>{t("min_Quantity")}</Label>
              <Input
                type="number"
                step="any"
                value={formData.min_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, min_quantity: e.target.value.replace(",", ".") })
                }
              />
            </div>
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("Category")}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select category")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nameUz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("Unit")}</Label>
              <Select value={formData.unity} onValueChange={(value) => setFormData({ ...formData, unity: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select unit")} />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Descriptions */}
          <div>
            <Label>{t("Description")}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          {/* Image */}
          <div>
            <Label>{t("Image")}</Label>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit">{editingProduct ? t("update") : t("create")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
