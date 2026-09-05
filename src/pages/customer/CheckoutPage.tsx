import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ChevronRight, MapPin, Truck, CreditCard, CheckCircle2, Calendar, Clock, PackageSearch, ShieldCheck, Plus } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import { AddressCard } from "@components/customer/AddressCard"
import { CheckoutSummary } from "@components/customer/CheckoutSummary"
import { EmptyState } from "@components/ui/EmptyState"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@components/ui/Sheet"
import { useCart, FREE_DELIVERY_THRESHOLD } from "@context/CartContext"
import { useAuth } from "@context/AuthContext"
import { useToast } from "@context/ToastContext"
import { useOrders } from "@context/OrdersContext"
import { paymentApi } from "../../services/api"
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
  { id: "card", label: "Debit / Credit Card", description: "Pay securely via Paystack (Mastercard, Visa, Verve)", icon: <CreditCard className="h-5 w-5" /> },
  { id: "transfer", label: "Bank Transfer", description: "Direct bank transfer to FreshCart corporate account", icon: <PackageSearch className="h-5 w-5" /> },
  { id: "cod", label: "Pay on Delivery", description: "Pay cash or POS upon grocery delivery", icon: <MapPin className="h-5 w-5" /> },
]

export function CheckoutPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const { createOrder, addresses, addAddress } = useOrders()
  const {
    lines, subtotal, deliveryFee, discount, total, itemCount, couponCode, clearCart,
  } = useCart()

  const [step, setStep] = React.useState<Step>("address")
  const [selectedAddress, setSelectedAddress] = React.useState(addresses[0]?.id || "")
  const [deliverySlot, setDeliverySlot] = React.useState(deliverySlots[0].id)
  const [paymentMethod, setPaymentMethod] = React.useState(paymentMethods[0].id)
  const [coupon, setCoupon] = React.useState(couponCode ?? "")
  const [deliveryNotes, setDeliveryNotes] = React.useState("")
  const [newAddressSheet, setNewAddressSheet] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [confirmedOrderNumber, setConfirmedOrderNumber] = React.useState<string | null>(null)
  const [newAddress, setNewAddress] = React.useState({
    fullName: "", phone: "", line1: "", line2: "", city: "Lagos", state: "Lagos State", label: "Home",
  })

  // Handle Paystack redirect callback if reference is present in URL
  React.useEffect(() => {
    const reference = searchParams.get("reference")
    if (reference) {
      setIsProcessing(true)
      paymentApi
        .verify(reference)
        .then((res) => {
          clearCart()
          success("Payment Verified", "Your order has been paid and confirmed.")
          navigate(`/orders/${res.orderNumber || res.orderId}`)
        })
        .catch((err) => {
          toastError("Verification Warning", err.message || "Failed to confirm payment status.")
        })
        .finally(() => setIsProcessing(false))
    }
  }, [searchParams, clearCart, navigate, success, toastError])

  React.useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      setSelectedAddress(addresses[0].id)
    }
  }, [addresses, selectedAddress])

  if (lines.length === 0 && !confirmedOrderNumber) {
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

  const stepIndex = steps.findIndex((s) => s.id === step)
  const canProceed = stepIndex === 0 ? !!selectedAddress : true

  const nextStep = () => {
    if (stepIndex === steps.length - 2) {
      // On the payment step, clicking Place Order initiates order creation
      handlePlaceOrder()
    } else if (stepIndex < steps.length - 1 && canProceed) {
      setStep(steps[stepIndex + 1].id)
    }
  }

  const prevStep = () => {
    if (stepIndex > 0) setStep(steps[stepIndex - 1].id)
  }

  const handlePlaceOrder = async () => {
    if (!user) return
    setIsProcessing(true)

    try {
      const activeAddress = addresses.find((a) => a.id === selectedAddress) || addresses[0]
      const chosenSlot = deliverySlots.find((s) => s.id === deliverySlot)
      const methodStr: "Card" | "Bank Transfer" | "Pay on Delivery" =
        paymentMethod === "card" ? "Card" : paymentMethod === "transfer" ? "Bank Transfer" : "Pay on Delivery"

      const orderItems = lines.map((l) => ({
        productId: l.productId,
        name: l.name,
        brand: l.brand,
        unit: l.unit,
        imageUrl: l.imageUrl,
        price: l.price,
        quantity: l.quantity,
      }))

      // 1. Create real order on backend & database
      const createdOrder = await createOrder({
        customerId: user.id,
        customerName: user.name || "Valued Customer",
        customerEmail: user.email,
        customerPhone: activeAddress?.phone || user.phone || "+234 803 000 1234",
        items: orderItems,
        subtotal,
        deliveryFee,
        discount,
        total,
        paymentMethod: methodStr,
        paymentStatus: paymentMethod === "cod" ? "PENDING" : "PENDING",
        address: activeAddress,
        deliverySlot: chosenSlot ? `${chosenSlot.label} (${chosenSlot.description})` : "Standard Slot",
        deliveryNotes: deliveryNotes.trim() || undefined,
        couponCode: coupon || undefined,
      })

      setConfirmedOrderNumber(createdOrder.orderNumber)

      // 2. Handle Payment Flow
      if (paymentMethod === "card") {
        try {
          const initRes = await paymentApi.initialize(createdOrder.id, user.email, total)
          const config = await paymentApi.getConfig()

          // Check if Paystack Inline JS popup is available
          if ((window as any).PaystackPop && config.publicKey && config.publicKey.startsWith("pk_")) {
            const handler = (window as any).PaystackPop.setup({
              key: config.publicKey,
              email: user.email,
              amount: Math.round(total * 100),
              ref: initRes.reference,
              onClose: () => {
                setIsProcessing(false)
                success("Order Created", "Your order has been recorded. You can complete payment at any time.")
                clearCart()
                navigate(`/orders/${createdOrder.orderNumber}`)
              },
              callback: async (response: any) => {
                await paymentApi.verify(response.reference)
                clearCart()
                setIsProcessing(false)
                setStep("confirmation")
                setTimeout(() => navigate(`/orders/${createdOrder.orderNumber}`), 1500)
              },
            })
            handler.openIframe()
            return
          } else {
            // Test mode / direct verification
            await paymentApi.verify(initRes.reference)
            clearCart()
            setIsProcessing(false)
            setStep("confirmation")
            setTimeout(() => navigate(`/orders/${createdOrder.orderNumber}`), 1200)
            return
          }
        } catch (payErr: any) {
          console.warn("Paystack initialize warning:", payErr)
          // Order was created, allow user to view order and retry
          clearCart()
          setIsProcessing(false)
          navigate(`/orders/${createdOrder.orderNumber}`)
          return
        }
      } else {
        // Bank transfer or Pay on Delivery
        clearCart()
        setIsProcessing(false)
        setStep("confirmation")
        success("Order Placed Successfully", `Order #${createdOrder.orderNumber} is being processed.`)
        setTimeout(() => {
          navigate(`/orders/${createdOrder.orderNumber}`)
        }, 1500)
      }
    } catch (err: any) {
      setIsProcessing(false)
      toastError("Checkout Error", err.message || "Failed to place order. Please try again.")
    }
  }

  const handleAddAddress = async () => {
    if (!newAddress.fullName.trim() || !newAddress.line1.trim() || !newAddress.phone.trim()) {
      toastError("Missing Information", "Please enter your name, phone number, and street address.")
      return
    }
    try {
      const created = await addAddress({
        fullName: newAddress.fullName,
        phone: newAddress.phone,
        line1: newAddress.line1,
        line2: newAddress.line2 || undefined,
        city: newAddress.city || "Lagos",
        state: newAddress.state || "Lagos State",
        label: newAddress.label || "Home",
        isDefault: addresses.length === 0,
      })
      setSelectedAddress(created.id)
      setNewAddressSheet(false)
      setNewAddress({
        fullName: "", phone: "", line1: "", line2: "", city: "Lagos", state: "Lagos State", label: "Home",
      })
      success("Address Saved", "Delivery address added to your profile.")
    } catch (err: any) {
      toastError("Address Error", err.message || "Could not save address.")
    }
  }

  return (
    <div className="container py-8 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">Checkout</h1>
        <div className="mt-4 flex items-center justify-between max-w-2xl overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center min-w-max">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                    i < stepIndex
                      ? "bg-fresh-600 text-white"
                      : i === stepIndex
                      ? "border-2 border-fresh-600 bg-white text-fresh-600"
                      : "bg-navy-100 text-navy-400"
                  )}
                >
                  {i < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : s.icon}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:inline",
                    i <= stepIndex ? "text-navy-900" : "text-navy-400"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn("mx-3 h-0.5 w-6 sm:w-12", i < stepIndex ? "bg-fresh-600" : "bg-navy-200")} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {step === "address" && (
            <div className="space-y-4 rounded-xl border border-navy-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-navy-900">Select Delivery Address</h2>
                  <p className="text-sm text-navy-500">Choose where your order will be delivered</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setNewAddressSheet(true)}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add New
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-lg border border-dashed border-navy-300 p-8 text-center">
                  <MapPin className="mx-auto h-8 w-8 text-navy-400" />
                  <p className="mt-2 text-sm font-medium text-navy-900">No delivery addresses found</p>
                  <Button size="sm" className="mt-4" onClick={() => setNewAddressSheet(true)}>
                    Add Delivery Address
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr.id)}
                      className={cn(
                        "cursor-pointer rounded-lg border p-4 transition-all",
                        selectedAddress === addr.id
                          ? "border-fresh-600 bg-fresh-50/50 ring-1 ring-fresh-600"
                          : "border-navy-200 hover:border-navy-300"
                      )}
                    >
                      <AddressCard address={addr} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === "delivery" && (
            <div className="space-y-4 rounded-xl border border-navy-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold text-navy-900">Choose Delivery Slot</h2>
                <p className="text-sm text-navy-500">Select your preferred delivery window in Lagos</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {deliverySlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => setDeliverySlot(slot.id)}
                    className={cn(
                      "cursor-pointer rounded-lg border p-4 transition-all",
                      deliverySlot === slot.id
                        ? "border-fresh-600 bg-fresh-50/50 ring-1 ring-fresh-600"
                        : "border-navy-200 hover:border-navy-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-navy-900">{slot.label}</p>
                      <span className="text-xs font-semibold text-fresh-700">{formatNaira(slot.price)}</span>
                    </div>
                    <p className="mt-1 text-xs text-navy-500">{slot.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "summary" && (
            <div className="space-y-4 rounded-xl border border-navy-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold text-navy-900">Order Notes & Coupon</h2>
                <p className="text-sm text-navy-500">Review your order and add special instructions</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="coupon">Coupon Code</Label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      id="coupon"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      placeholder="e.g. WELCOME10, FRESH2000"
                    />
                    <Button
                      variant={coupon ? "default" : "secondary"}
                      onClick={() => {
                        if (coupon) success("Coupon Code Entered", `Code ${coupon} will be verified at checkout.`)
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Delivery Instructions (Optional)</Label>
                  <textarea
                    id="notes"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="mt-1 w-full rounded-md border border-navy-200 p-2 text-sm focus:border-fresh-500 focus:outline-none focus:ring-1 focus:ring-fresh-500"
                    rows={3}
                    placeholder="e.g., Ring the bell at flat 4B, leave at reception with security if unavailable..."
                  />
                </div>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-4 rounded-xl border border-navy-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold text-navy-900">Payment Gateway</h2>
                <p className="text-sm text-navy-500">Choose your payment method to complete the purchase</p>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-all",
                      paymentMethod === pm.id
                        ? "border-fresh-600 bg-fresh-50/50 ring-1 ring-fresh-600"
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
                        <p className="font-semibold text-navy-900">{pm.label}</p>
                        <p className="text-xs text-navy-500">{pm.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="rounded-lg bg-navy-50 p-4 border border-navy-200/80 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-fresh-600 shrink-0 mt-0.5" />
                <div className="text-xs text-navy-600 space-y-1">
                  <p className="font-semibold text-navy-900">256-bit Encrypted Transaction</p>
                  <p>All card payments are securely routed and processed via Paystack's PCI-DSS Level 1 certified gateway.</p>
                </div>
              </div>
            </div>
          )}

          {step === "confirmation" && (
            <div className="rounded-xl border border-fresh-200 bg-fresh-50 p-8 text-center space-y-4">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-fresh-100 text-fresh-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-navy-900">Order Placed Successfully!</h2>
              <p className="text-sm text-navy-600">
                {confirmedOrderNumber ? `Order #${confirmedOrderNumber} has been received.` : "Your order is being processed."}
              </p>
              <p className="text-xs text-navy-500">Redirecting to live order status…</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={prevStep} disabled={stepIndex === 0 || isProcessing}>
              ← Back
            </Button>
            {step === "confirmation" ? (
              <Button size="lg" onClick={() => navigate("/orders")}>
                View My Orders
              </Button>
            ) : (
              <Button size="lg" onClick={nextStep} disabled={!canProceed || isProcessing}>
                {isProcessing
                  ? "Processing Order…"
                  : stepIndex === steps.length - 2
                  ? `Place Order • ${formatNaira(total)}`
                  : "Continue"}{" "}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CheckoutSummary
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            discount={discount}
            total={total}
            freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
            itemCount={itemCount}
          />
        </div>
      </div>

      {/* New Address Modal Sheet */}
      <Sheet open={newAddressSheet} onOpenChange={setNewAddressSheet}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Delivery Address</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  placeholder="e.g. Amaka Obi"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  placeholder="+234 803 000 0000"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="line1">Street Address</Label>
              <Input
                id="line1"
                value={newAddress.line1}
                onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                placeholder="Plot 12, Adeola Odeku Street"
              />
            </div>
            <div>
              <Label htmlFor="line2">Apartment / Suite / Flat</Label>
              <Input
                id="line2"
                value={newAddress.line2}
                onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                placeholder="Flat 3B"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="city">City / Area</Label>
                <Input
                  id="city"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  placeholder="Victoria Island"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  placeholder="Lagos State"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleAddAddress}>
                Save Address
              </Button>
              <Button variant="outline" onClick={() => setNewAddressSheet(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
