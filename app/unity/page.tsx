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



export interface Unit {
  id: number
  nameUz: string
  nameRu: string
}

export default function UnitsPage() {
  const { t } = useLanguage()
  const [units, setUnits] = useState<Unit[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [loading, setLoading] = useState(true)
  const [nameUz, setNameUz] = useState("")
  const [nameRu, setNameRu] = useState("")
  const ITEMS_PER_PAGE = 10

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
  const token = typeof window !== "undefined" ? localStorage.getItem("agroAdminToken") : null

  const api = axios.create({ baseURL })
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/unity/list/")
      setUnits(data.results.map((u: any) => ({
        id: u.id,
        nameUz: u.name_uz,
        nameRu: u.name_ru
      })))
    } catch (error) {
      console.error(error)
      toast.error(t("Failed to fetch units"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUnits() }, [])

  const paginatedUnits = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return units.slice(start, start + ITEMS_PER_PAGE)
  }, [units, currentPage])

  // CREATE
  const handleCreateUnit = async (data: Omit<Unit, "id">) => {
    try {
      await api.post("/unity/create/", { name_uz: data.nameUz, name_ru: data.nameRu })
      toast.success(t("Unit created"))
      fetchUnits()
    } catch (error: any) {
      console.error(error)
      toast.error(error?.response?.data?.detail || t("Failed to create unit"))
    }
  }

  // UPDATE
  const handleUpdateUnit = async (id: number, data: Omit<Unit, "id">) => {
    try {
      await api.patch(`/unity/${id}/update/`, { name_uz: data.nameUz, name_ru: data.nameRu })
      toast.success(t("Unit updated"))
      fetchUnits()
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
    setNameUz("")
    setNameRu("")
    setIsFormOpen(true)
  }

  // OPEN EDIT FORM
  const openEditForm = (unit: Unit) => {
    setEditingUnit(unit)
    setNameUz(unit.nameUz)
    setNameRu(unit.nameRu)
    setIsFormOpen(true)
  }

  // FORM SUBMIT
  const handleFormSubmit = async () => {
    const data = { nameUz, nameRu }
    if (editingUnit) {
      await handleUpdateUnit(editingUnit.id, data)
    } else {
      await handleCreateUnit(data)
    }
    setIsFormOpen(false)
  }

  const handleFormClose = () => {
    setEditingUnit(null)
    setNameUz("")
    setNameRu("")
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
                      <TableHead>{t("Name (UZ)")}</TableHead>
                      <TableHead>{t("Name (RU)")}</TableHead>
                      <TableHead>{t("Actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUnits.map((unit, index) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                        <TableCell>{unit.nameUz}</TableCell>
                        <TableCell>{unit.nameRu}</TableCell>
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
              {Math.ceil(units.length / ITEMS_PER_PAGE) > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(units.length / ITEMS_PER_PAGE)}
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
                      <h2 className="text-xl font-bold mb-4">{editingUnit ? t("Edit Unit") : t("Add Unit")}</h2>
                      <Input
                        placeholder={t("Name (UZ)")}
                        value={nameUz}
                        onChange={(e) => setNameUz(e.target.value)}
                        className="mb-4"
                      />
                      <Input
                        placeholder={t("Name (RU)")}
                        value={nameRu}
                        onChange={(e) => setNameRu(e.target.value)}
                        className="mb-4"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleFormClose}>{t("cancel")}</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleFormSubmit}>{t("save")}</Button>
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
