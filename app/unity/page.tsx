"use client"

import { useState, useEffect } from "react"
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

export interface Unit {
  id: number
  name: string
}

export default function UnitsPage() {
  const { t } = useLanguage()
  const [units, setUnits] = useState<Unit[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const ITEMS_PER_PAGE = 150

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const token = typeof window !== "undefined" ? localStorage.getItem("agroAdminToken") : null

  const api = axios.create({ baseURL })
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`

  // FETCH UNITS
  const fetchUnits = async (page: number = 1) => {
    try {
      setLoading(true)
      const { data } = await api.get(`/unity/list/?page=${page}&page_size=${ITEMS_PER_PAGE}`)
      setUnits(
        data.results.map((u: any) => ({
          id: u.id,
          name: u.name,
        }))
      )
      setTotalPages(data.total_pages)
    } catch (error) {
      console.error(error)
      toast.error(t("Failed to fetch units"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnits(currentPage)
  }, [currentPage])

  // CREATE
  const handleCreateUnit = async () => {
    try {
      await api.post("/unity/create/", { name })
      toast.success(t("Unit created"))
      fetchUnits(currentPage)
    } catch (error: any) {
      console.error(error)
      toast.error(error?.response?.data?.detail || t("Failed to create unit"))
    }
  }

  // UPDATE
  const handleUpdateUnit = async (id: number) => {
    try {
      await api.patch(`/unity/${id}/update/`, { name })
      toast.success(t("Unit updated"))
      fetchUnits(currentPage)
    } catch (error: any) {
      console.error(error)
      toast.error(error?.response?.data?.detail || t("Failed to update unit"))
    }
  }

  // DELETE
  const handleDeleteUnit = async (id: number) => {
    try {
      await api.delete(`/unity/${id}/delete/`)
      setUnits(prev => prev.filter(u => u.id !== id))
      toast.success(t("Unit deleted"))
    } catch {
      toast.error(t("Failed to delete unit"))
    }
  }

  // OPEN CREATE FORM
  const openCreateForm = () => {
    setEditingUnit(null)
    setName("")
    setIsFormOpen(true)
  }

  // OPEN EDIT FORM
  const openEditForm = (unit: Unit) => {
    setEditingUnit(unit)
    setName(unit.name)
    setIsFormOpen(true)
  }

  // FORM SUBMIT
  const handleFormSubmit = async () => {
    if (!name.trim()) {
      toast.error(t("Name is required"))
      return
    }

    if (editingUnit) {
      await handleUpdateUnit(editingUnit.id)
    } else {
      await handleCreateUnit()
    }
    setIsFormOpen(false)
  }

  const handleFormClose = () => {
    setEditingUnit(null)
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
              <h1 className="text-3xl font-bold">{t("Unit")}</h1>
              <p className="text-muted-foreground">{t("Manage your measurement units")}</p>
            </div>
            <Button
              onClick={openCreateForm}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> {t("Add Unit")}
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
                    {units.map((unit, index) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </TableCell>
                        <TableCell>{unit.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEditForm(unit)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteUnit(unit.id)}
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
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
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
                        {editingUnit ? t("Edit Unit") : t("Add Unit")}
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
