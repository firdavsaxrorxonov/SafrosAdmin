import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Users, ShoppingCart } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Add Product",
      description: "Create a new product",
      icon: Package,
      href: "/products",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Add User",
      description: "Create a new user account",
      icon: Users,
      href: "/users",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "View Orders",
      description: "Check recent orders",
      icon: ShoppingCart,
      href: "/orders",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used actions</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {actions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent">
              <div className={`p-2 rounded-md ${action.color} mr-3`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
