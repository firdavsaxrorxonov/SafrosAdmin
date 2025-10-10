// OrderDetails.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order } from "@/types/order";
import { useLanguage } from "@/contexts/language-context";

interface OrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function OrderDetails({ isOpen, onClose, order }: OrderDetailsProps) {
  const { t } = useLanguage();

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("orderDetails")} - {order.customerName}
          </DialogTitle>
          <DialogDescription>{t("completeOrderInfo")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-2">{t("customerInformation")}</h3>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">{t("name")}:</span>{" "}
                {order.customerName}
              </div>
              <div>
                <span className="font-medium">{t("email")}:</span>{" "}
                {order.customerEmail}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-2">{t("orderItems")}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("product")}</TableHead>
                  <TableHead>{t("quantity")}</TableHead>
                  <TableHead>{t("price")}</TableHead>
                  <TableHead>{t("total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, idx) => (
                  <TableRow key={`${item.productId}-${idx}`}>
                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.productPrice} UZS</TableCell>
                    <TableCell>{item.price} UZS</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
