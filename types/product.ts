export interface Product {
  id: number
  nameUz: string
  nameRu: string
  price: number
  category: string
  description: string
  image?: string
  unit: "piece" | "kg"
  createdAt: string
}

export interface Category {
  id: number
  nameUz: string
  nameRu: string
  image?: string
}
