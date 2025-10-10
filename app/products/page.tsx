"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout/layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import axios from "axios"

import { ProductTable } from "@/components/products/product-table"
import { ProductForm } from "@/components/products/product-form"
import { Pagination } from "@/components/products/pagination"
import type { Product, Category } from "@/types/product"
import { useLanguage } from "@/contexts/language-context"

const ITEMS_PER_PAGE = 10

export default function ProductsPage() {
  const { language, t } = useLanguage()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]) // ❌ name_uz, name_ru olib tashlandi
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [totalPages, setTotalPages] = useState(1)

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const token = typeof window !== "undefined" ? localStorage.getItem("agroAdminToken") : null

  const api = axios.create({ baseURL })
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`
  api.defaults.headers.common["Accept-Language"] = language

  // 📌 Kategoriyalar va birliklarni olish
  const fetchCategoriesAndUnits = async () => {
    try {
      const [catRes, unitRes] = await Promise.all([
        api.get("/category/list/?page_size=150"),
        api.get("/unity/list/"),
      ])

      setCategories(
        catRes.data.results.map((c: any) => ({
          id: c.id,
          name: c.name, // ❌ faqat name
        }))
      )

      setUnits(
        unitRes.data.results.map((u: any) => ({
          id: u.id,
          name: u.name, // ❌ faqat name
        }))
      )
    } catch (error) {
      console.error("Failed to fetch categories or units:", error)
      alert(t("Error") + ": " + t("Failed to fetch suppliers"))
    }
  }

  // 📌 Serverdan mahsulotlarni olish (pagination + search + category)
  const fetchProducts = async () => {
    try {
      setLoading(true)

      const params: any = {
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
      }

      if (searchTerm.trim() !== "") {
        params.search = searchTerm
      }

      if (selectedCategory !== "all") {
        params.category = selectedCategory
      }

      const { data } = await api.get("/product/list/", { params })

      const mapped = (data.results || []).map((p: any) => ({
        ...p,
        category: typeof p.category === "object" ? p.category.id : p.category,
        unity: typeof p.unity === "object" ? p.unity.id : p.unity,
        quantity_left: p.quantity_left || "",
        name: p.name, // ❌ faqat name
      }))

      setProducts(mapped)
      setTotalPages(data.total_pages || 1)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      alert(t("Error") + ": " + t("Failed to fetch products"))
    } finally {
      setLoading(false)
    }
  }

  // 📌 Effektlar
  useEffect(() => {
    fetchCategoriesAndUnits()
  }, [language])

  useEffect(() => {
    fetchProducts()
  }, [language, currentPage, searchTerm, selectedCategory])

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    )
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.delete(`/product/${id}/delete/`)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Failed to delete product:", error)
      alert(t("Error") + ": " + t("Failed to fetch suppliers"))
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t("products")}</h1>
            </div>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setIsFormOpen(true)
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" /> {t("create")}
            </Button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex gap-4 flex-wrap items-center">
            <Input
              placeholder={t("products")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="max-w-xs"
            />

            <div className="w-64">
              <Select
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("categoriesTitle")}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {/* ❌ faqat name */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : (
            <>
              <ProductTable
                products={products}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateProduct={handleUpdateProduct}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                units={units}
                categories={categories}
              />

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}

              <ProductForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                categories={categories}
                units={units}
                editingProduct={editingProduct}
                onSuccess={fetchProducts}
              />
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
