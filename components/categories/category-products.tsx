"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Product, Category } from "@/types/product"

interface CategoryProductsProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
  products: Product[]
}

export function CategoryProducts({ isOpen, onClose, category, products }: CategoryProductsProps) {
  if (!category) return null

  const categoryProducts = products.filter((product) => product.category === category.nameUz)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Products in {category.nameUz}</DialogTitle>
          <DialogDescription>{categoryProducts.length} products found in this category</DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          {categoryProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name (UZ)</TableHead>
                  <TableHead>Name (RU)</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.nameUz}</TableCell>
                    <TableCell>{product.nameRu}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.unit}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No products found in this category</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
