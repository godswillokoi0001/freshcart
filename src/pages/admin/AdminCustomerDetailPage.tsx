import { Link, useParams } from "react-router-dom"
import { ChevronLeft, MapPin, Mail, Phone, Package, CreditCard, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Badge } from "@components/ui/Badge"
import { customers, adminOrders } from "@data/admin"
import { formatNaira, formatDate } from "@lib/format"
import { cn } from "@lib/utils"

export function AdminCustomerDetailPage() {
  const { id } = useParams()
  const customer = customers.find(c => c.id === id)
  const orders = adminOrders.filter(o => o.customerId === id).slice(0, 10)

  if (!customer) return <div className="py-16 text-center"><h1 className="text-xl font-bold text-navy-900">Customer not found</h1><Button variant="outline" className="mt-4" onClick={() => window.history.back()}><ChevronLeft className="h-4 w-4" /> Back</Button></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={() => window.history.back()}><ChevronLeft className="h-5 w-5" /></Button><div><h1 className="text-xl font-bold text-navy-900">{customer.name}</h1><p className="text-sm text-navy-500">{customer.email} · {customer.phone}</p></div><div className="ml-auto"><Badge variant={customer.status === "ACTIVE" ? "success" : customer.status === "SUSPENDED" ? "destructive" : "default"}>{customer.status}</Badge></div></div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-lg border border-navy-200 bg-white p-6"><h2 className="text-lg font-semibold text-navy-900">Recent Orders</h2>
            <div className="mt-4 space-y-3">
              {orders.length === 0 ? <p className="text-center text-navy-500">No orders yet</p> : orders.map(o => (
                <Link key={o.id} to={`/admin/orders/${o.id}`} className="block p-3 rounded-lg border border-navy-100 hover:bg-navy-50">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Package className="h-4 w-4 text-navy-400" /><div><p className="font-medium text-navy-900">{o.orderNumber}</p><p className="text-sm text-navy-500">{formatDate(o.createdAt)} · {o.items.length} items</p></div></div><span className="font-semibold text-navy-900">{formatNaira(o.total)}</span></div></Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg border border-navy-200 bg-white p-6"><h2 className="text-lg font-semibold text-navy-900">Profile</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-navy-500">Name</dt><dd className="font-medium text-navy-900">{customer.name}</dd></div><div className="flex justify-between"><dt className="text-navy-500">Email</dt><dd className="font-medium text-navy-900">{customer.email}</dd></div><div className="flex justify-between"><dt className="text-navy-500">Phone</dt><dd className="font-medium text-navy-900">{customer.phone}</dd></div><div className="flex justify-between"><dt className="text-navy-500">Status</dt><dd><Badge variant={customer.status === "ACTIVE" ? "success" : customer.status === "SUSPENDED" ? "destructive" : "default"}>{customer.status}</Badge></dd></div><div className="flex justify-between"><dt className="text-navy-500">Joined</dt><dd className="font-medium text-navy-900">{formatDate(customer.joinedAt)}</dd></div><div className="flex justify-between"><dt className="text-navy-500">Last Order</dt><dd className="font-medium text-navy-900">{customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "Never"}</dd></div></dl></section>

          <section className="rounded-lg border border-navy-200 bg-white p-6"><h2 className="text-lg font-semibold text-navy-900">Summary</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-navy-500">Total Orders</dt><dd className="font-bold text-navy-900">{customer.ordersCount}</dd></div><div className="flex justify-between"><dt className="text-navy-500">Total Spent</dt><dd className="font-bold text-navy-900">{formatNaira(customer.totalSpent)}</dd></div></dl></section>
        </div>
      </div>
    </div>
  )
}
