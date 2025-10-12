"use client"

import { useState, useEffect, useMemo } from "react"
import { Layout } from "@/components/layout/layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Loader2 } from "lucide-react"
import { Pagination } from "@/components/products/pagination"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/language-context"

export interface Obyekt {
  id: number
  name: string
}

export default function ObyektPage() {
  const { t } = useLanguage()
  const [obyektlar, setObyektlar] = useState<Obyekt[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingObyekt, setEditingObyekt] = useState<Obyekt | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const ITEMS_PER_PAGE = 10

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const token = typeof window !== "undefined" ? localStorage.getItem("agroAdminToken") : null

  const api = axios.create({ baseURL })
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`

  // FETCH
  const fetchObyektlar = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/obyekt/list/")
      setObyektlar(
        data.results.map((o: any) => ({
          id: o.id,
          name: o.name,
        }))
      )
    } catch (error) {
      console.error(error)
      toast.error(t("Failed to fetch objects"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchObyektlar()
  }, [])

  const paginatedObyektlar = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return obyektlar.slice(start, start + ITEMS_PER_PAGE)
  }, [obyektlar, currentPage])

  // CREATE
  const handleCreateObyekt = async () => {
    try {
      await api.post("/obyekt/create/", { name })
      toast.success(t("Object created"))
      fetchObyektlar()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.response?.data?.detail || t("Failed to create object"))
    }
  }

  // UPDATE
  const handleUpdateObyekt = async (id: number) => {
    try {
      await api.patch(`/obyekt/${id}/update/`, { name })
      toast.success(t("Object updated"))
      fetchObyektlar()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.response?.data?.detail || t("Failed to update object"))
    }
  }

  // DELETE
  const handleDeleteObyekt = async (id: number) => {
    try {
      await api.delete(`/obyekt/${id}/delete/`)
      setObyektlar(prev => prev.filter(o => o.id !== id))
      toast.success(t("Object deleted"))
    } catch {
      toast.error(t("Failed to delete object"))
    }
  }

  // OPEN CREATE FORM
  const openCreateForm = () => {
    setEditingObyekt(null)
    setName("")
    setIsFormOpen(true)
  }

  // OPEN EDIT FORM
  const openEditForm = (obyekt: Obyekt) => {
    setEditingObyekt(obyekt)
    setName(obyekt.name)
    setIsFormOpen(true)
  }

  // FORM SUBMIT
  const handleFormSubmit = async () => {
    if (!name.trim()) {
      toast.error(t("Name is required"))
      return
    }

    if (editingObyekt) {
      await handleUpdateObyekt(editingObyekt.id)
    } else {
      await handleCreateObyekt()
    }
    setIsFormOpen(false)
  }

  const handleFormClose = () => {
    setEditingObyekt(null)
    setName("")
    setIsFormOpen(false)
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t("Objects")}</h1>
              <p className="text-muted-foreground">{t("Manage your objects")}</p>
            </div>
            <Button
              onClick={openCreateForm}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> {t("Add Object")}
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>№</TableHead>
                      <TableHead>{t("Name")}</TableHead>
                      <TableHead>{t("Actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedObyektlar.map((obyekt, index) => (
                      <TableRow key={obyekt.id}>
                        <TableCell className="font-medium">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </TableCell>
                        <TableCell>{obyekt.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEditForm(obyekt)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteObyekt(obyekt.id)}
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

              {/* Pagination */}
              {Math.ceil(obyektlar.length / ITEMS_PER_PAGE) > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(obyektlar.length / ITEMS_PER_PAGE)}
                  onPageChange={setCurrentPage}
                />
              )}

              {/* Modal Form */}
              <AnimatePresence>
                {isFormOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 flex items-center justify-center bg-black/20 z-50"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white p-6 rounded-lg w-96"
                    >
                      <h2 className="text-xl font-bold mb-4">
                        {editingObyekt ? t("Edit Object") : t("Add Object")}
                      </h2>
                      <Input
                        placeholder={t("Name")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mb-4"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleFormClose}>
                          {t("cancel")}
                        </Button>
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={handleFormSubmit}
                        >
                          {t("save")}
                        </Button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
