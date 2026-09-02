import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight, MapPin, Truck, CreditCard, CheckCircle2, Calendar, Clock, PackageSearch } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import { RadioGroup, RadioGroupItem } from "@components/ui/RadioGroup"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/Tabs"
import { AddressCard } from "@components/customer/AddressCard"
import { CheckoutSummary } from "@components/customer/CheckoutSummary"
import { EmptyState } from "@components/ui/EmptyState"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@components/ui/Sheet"
import { useCart, FREE_DELIVERY_THRESHOLD } from "@context/CartContext"
import { useAuth } from "@context/AuthContext"
import { addresses, currentCustomer } from "@data/orders"
import { formatNaira } from "@lib/format"
import { cn } from "@lib/utils"

type Step = "address" | "delivery" | "summary" | "payment" | "confirmation"
const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "address", label: "Delivery Address", icon: <MapPin className="h-4 w-4" /> },
  { id: "delivery", label: "Delivery Slot", icon: <Truck className="h-4 w-4" /> },
  { id: "summary", label: "Order Summary", icon: <PackageSearch className="h-4 w-4" /> },
  { id: "payment", label: "Payment", icon: <CreditCard className="h-4 w-4" /> },
  { id: "confirmation", label: "Confirmation", icon: <CheckCircle2 className="h-4 w-4" /> },
]

const deliverySlots = [
  { id: "express", label: "Express", description: "Delivered within 2 hours", price: 2000, available: true },
  { id: "morning", label: "Morning", description: "8:00 AM – 12:00 PM", price: 1500, available: true },
  { id: "afternoon", label: "Afternoon", description: "12:00 PM – 4:00 PM", price: 1500, available: true },
  { id: "evening", label: "Evening", description: "4:00 PM – 8:00 PM", price: 1500, available: true },
  { id: "tomorrow", label: "Tomorrow", description: "Choose a slot tomorrow", price: 1000, available: true },
]

const paymentMethods = [
  { id: "card", label: "Card (Debit/Credit)", description: "Pay securely with Paystack", icon: <CreditCard className="h-5 w-5" /> },
  { id: "transfer", label: "Bank Transfer", description: "Pay via bank transfer", icon: <PackageSearch className="h-5 w-5" /> },
  { id: "cod", label: "Pay on Delivery", description: "Cash or card on delivery", icon: <MapPin className="h-5 w-5" /> },
]

export function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    lines, subtotal, deliveryFee, discount, total, itemCount, couponCode, clearCart, setQuantity, removeItem
  } = useCart()

  const [step, setStep] = React.useState<Step>("address")
  const [selectedAddress, setSelectedAddress] = React.useState(addresses[0].id)
  const [deliverySlot, setDeliverySlot] = React.useState(deliverySlots[0].id)
  const [paymentMethod, setPaymentMethod] = React.useState(paymentMethods[0].id)
  const [coupon, setCoupon] = React.useState(couponCode ?? "")
  const [newAddressSheet, setNewAddressSheet] = React.useState(false)
  const [newAddress, setNewAddress] = React.useState({
    fullName: "", phone: "", line1: "", line2: "", city: "", state: "", label: "Home",
  })

  if (lines.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="mb-2 text-2xl font-bold text-navy-900">Checkout</h1>
        <EmptyState
          icon={PackageSearch}
          title="Your cart is empty"
          description="Add items to your cart before proceeding to checkout."
          action={{ label: "Start shopping", href: "/shop" }}
        />
      </div>
    )
  }

  if (!user) {
    React.useEffect(() => {
      alert("Please sign in to complete checkout.")
      navigate("/sign-in")
    }, [navigate])
    return null
  }

  const stepIndex = steps.findIndex((s) => s.id === step)
  const currentStep = steps[stepIndex]
  const canProceed = stepIndex === 0 ? !!selectedAddress : true

  const nextStep = () => {
    if (stepIndex < steps.length - 1 && canProceed) setStep(steps[stepIndex + 1].id)
  }
  const prevStep = () => {
    if (stepIndex > 0) setStep(steps[stepIndex - 1].id)
  }

  const placeOrder = () => {
    setStep("confirmation")
    setTimeout(() => {
      clearCart()
      navigate("/orders/FC-" + Math.random().toString(36).slice(2, 8).toUpperCase())
    }, 1500)
  }

  const handleAddAddress = () => {
    const addr = { ...newAddress, id: `addr-${Date.now()}`, isDefault: false }
    setSelectedAddress(addr.id)
    setNewAddressSheet(false)
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center gap-2">
        <h1 className="text-2xl font-bold text-navy-900">Checkout</h1>
        <ol className="flex flex-1 items-center">
          {steps.map((s, i) => (
            <li key={s.id} className="flex items-center">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium", i < stepIndex ? "bg-fresh-600 text-white" : i === stepIndex ? "border-2 border-fresh-600 bg-white text-fresh-600" : "bg-navy-100 text-navy-400")}>
                {i < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : s.icon}
              </div>
              {i < steps.length - 1 && <span className={cn("mx-2 h-0.5 flex-1 max-w-32", i < stepIndex ? "bg-fresh-600" : "bg-navy-200")} />}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Tabs value={step} onValueChange={(value) => setStep(value as Step)}>
            <TabsList className="h-auto bg-transparent p-0">
              {steps.map((s) => (
                <TabsTrigger key={s.id} value={s.id} className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <div className="flex items-center gap-2">
                    {s.icon}
                    <span>{s.label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="address" className="mt-6">
              <h2 className="text-lg font-semibold text-navy-900">Delivery Address</h2>
              <p className="mt-1 text-sm text-navy-500">Choose or add the address for this delivery.</p>
              <div className="mt-4 space-y-3">
                {addresses.map((a) => (
                  <AddressCard
                    key={a.id}
                    address={a}
                    selected={selectedAddress === a.id}
                    onSelect={() => setSelectedAddress(a.id)}
                  />
                ))}
              </div>
              <Button variant="outline" className="mt-4 w-full" onClick={() => setNewAddressSheet(true)}>
                + Add new address
              </Button>
            </TabsContent>

            <TabsContent value="delivery" className="mt-6">
              <h2 className="text-lg font-semibold text-navy-900">Delivery Slot</h2>
              <p className="mt-1 text-sm text-navy-500">Select your preferred delivery window.</p>
              <div className="mt-4 space-y-2">
                {deliverySlots.map((slot) => (
                  <label
                    key={slot.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-colors",
                      deliverySlot === slot.id
                        ? "border-fresh-600 ring-1 ring-fresh-600 bg-fresh-50"
                        : "border-navy-200 hover:border-navy-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliverySlot === slot.id}
                      onChange={() => setDeliverySlot(slot.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-navy-900">{slot.label}</p>
                        <p className="text-sm text-navy-500">{slot.description}</p>
                      </div>
                    </div>
                    <span className={cn("text-sm font-medium", slot.price === 0 ? "text-success-600" : "text-navy-900")}>
                      {slot.price === 0 ? "Free" : `+ ${formatNaira(slot.price)}`}
                    </span>
                  </label>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="summary" className="mt-6">
              <CheckoutSummary
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                discount={discount}
                total={total}
                freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
                itemCount={itemCount}
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="coupon">Coupon Code</Label>
                    <div className="mt-1 flex gap-2">
                      <Input
                        id="coupon"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="Enter coupon code"
                      />
                      <Button
                        variant={coupon ? "default" : "secondary"}
                        onClick={() => setCoupon(coupon) && success("Coupon applied", ` "${coupon}" will be applied at checkout.`)}
                      >
                        {coupon ? "Applied" : "Apply"}
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-navy-200 p-4 text-sm">
                    <p className="font-medium text-navy-900">Delivery Notes (optional)</p>
                    <textarea
                      className="mt-1 w-full rounded-md border border-navy-200 p-2 text-sm focus:border-fresh-500 focus:outline-none focus:ring-1 focus:ring-fresh-500"
                      rows={2}
                      placeholder="e.g., Call when you reach the gate, leave with security..."
                    />
                  </div>
                </div>
              </CheckoutSummary>
            </TabsContent>

            <TabsContent value="payment" className="mt-6">
              <h2 className="text-lg font-semibold text-navy-900">Payment Method</h2>
              <p className="mt-1 text-sm text-navy-500">Choose how you'd like to pay.</p>
              <div className="mt-4 space-y-3">
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-colors",
                      paymentMethod === pm.id
                        ? "border-fresh-600 ring-1 ring-fresh-600 bg-fresh-50"
                        : "border-navy-200 hover:border-navy-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-600">
                        {pm.icon}
                      </div>
                      <div>
                        <p className="font-medium text-navy-900">{pm.label}</p>
                        <p className="text-sm text-navy-500">{pm.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {paymentMethod === "card" && (
                <div className="mt-4 rounded-lg border border-navy-200 bg-navy-50 p-4 text-sm text-navy-600">
                  <p className="font-medium text-navy-900">Mock Payment</p>
                  <p>This is a frontend simulation. Click "Place Order" to complete checkout.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="confirmation" className="mt-6">
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-fresh-600 bg-fresh-50 p-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-fresh-100 text-fresh-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-navy-900">Order Confirmed!</h2>
                  <p className="mt-2 text-sm text-navy-600">Your order has been placed successfully.</p>
                  <p className="mt-1 text-sm text-navy-500">Redirecting to order tracking…</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={prevStep} disabled={stepIndex === 0}>
              ← Back
            </Button>
            {step === "confirmation" ? (
              <Button size="lg" variant="secondary" onClick={() => navigate("/")}>
                Continue Shopping
              </Button>
            ) : (
              <Button size="lg" onClick={nextStep} disabled={!canProceed}>
                {stepIndex === steps.length - 2 ? "Place Order" : "Continue"} <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <CheckoutSummary
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            discount={discount}
            total={total}
            freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
            itemCount={itemCount}
          >
            <div className="mt-4 space-y-3">
              <p className="text-sm text-navy-500">Your order will be processed after confirmation.</p>
              <p className="text-xs text-navy-400">No charges will be made — this is a frontend simulation. Order confirmed locally.</p>
            </div>
          </CheckoutSummary>
        </div>
      </div>

      <Sheet open={newAddressSheet} onOpenChange={setNewAddressSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New Address</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="line1">Address Line 1</Label>
              <Input id="line1" value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="line2">Address Line 2 (optional)</Label>
              <Input id="line2" value={newAddress.line2} onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleAddAddress}>Save Address</Button>
              <Button variant="outline" onClick={() => setNewAddressSheet(false)}>Cancel</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
