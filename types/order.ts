export interface Order {
  id: string
  customerName: string
  customerEmail: string
  amount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  itemCount: number
  items: OrderItem[]
  createdAt: string
}

export interface OrderItem {
  productId: number
  productName: string
  quantity: number
  price: number
}

export interface User {
  id: number
  username: string
  email: string
  role: "admin" | "user" | "moderator"
  createdAt: string
  lastLogin?: string
}
