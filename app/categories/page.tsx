"use client"
import { useState, useEffect, useMemo } from "react"
import { Layout } from "@/components/layout/layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CategoryCard } from "@/components/categories/category-card"
import { CategoryForm } from "@/components/categories/category-form"
import { CategoryProducts } from "@/components/categories/category-products"
import { Plus, Loader2 } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import type { Category } from "@/types/product"
import { useLanguage } from "@/contexts/language-context"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState("")

  const { lang, t } = useLanguage()

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const imgBaseURL = process.env.NEXT_PUBLIC_API_ImgBASE_URL ?? ""
  const token =
    typeof window !== "undefined" ? localStorage.getItem("agroAdminToken") : null

  const api = axios.create({ baseURL })
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`
  api.defaults.headers.common["Accept-Language"] = lang

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/category/list/?page_size=99")
      if (Array.isArray(data.results)) {
        const normalized = data.results.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          order: cat.order ?? 0,
          image: cat.image
            ? cat.image.startsWith("http")
              ? cat.image
              : `${imgBaseURL}${cat.image}`
            : "/placeholder.svg",
        }))

        normalized.sort((a, b) => a.order - b.order)
        setCategories(normalized)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error(t("Loading categories..."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const name = lang === "ru" ? cat.name : cat.name
      return name.toLowerCase().includes(searchText.toLowerCase())
    })
  }, [categories, searchText, lang])

  const handleCreateCategory = async (formData: FormData) => {
    try {
      await api.post("/category/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success(t("addCategory"))
      fetchCategories()
    } catch (error) {
      console.error(error)
      toast.error(t("Please fill all required fields"))
    }
  }

  const handleUpdateCategory = async (formData: FormData) => {
    if (!editingCategory) return
    try {
      await api.patch(`/category/${editingCategory.id}/update/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success(t("update"))
      fetchCategories()
    } catch (error) {
      console.error(error)
      toast.error(t("Please fill all required fields"))
    } finally {
      setEditingCategory(null)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleDeleteCategory = async (id: string | number) => {
    try {
      await api.delete(`/category/${id}/delete/`)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast.success(t("delete"))
    } catch (error) {
      console.error(error)
      toast.error(t("Error"))
    }
  }

  const handleViewProducts = (category: Category) => {
    setSelectedCategory(category)
    setIsProductsModalOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
  }

  const getCategoryName = (cat: Category) => (lang === "ru" ? cat.nameRu : cat.nameUz)

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2">
              <h1 className="text-3xl font-bold">{t("categoriesTitle")}</h1>
              <p className="text-muted-foreground">{t("categoriesSubtitle")}</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={t("Search")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("addCategory")}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={{ ...category, nameUz: getCategoryName(category) }}
                  onEdit={handleEditCategory}
                  onDelete={() => handleDeleteCategory(category.id)}
                  onViewProducts={handleViewProducts}
                  productCount={0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">{t("noCategories")}</div>
          )}

          <CategoryForm
            isOpen={isFormOpen}
            onClose={handleFormClose}
            onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
            editingCategory={editingCategory}
          />

          <CategoryProducts
            isOpen={isProductsModalOpen}
            onClose={() => setIsProductsModalOpen(false)}
            category={selectedCategory}
            products={[]}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
