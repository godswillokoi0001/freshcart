import React from "react"
import { User, Shield, Bell, CreditCard, Globe, Database, Save, Loader2, Truck } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import { Switch } from "@components/ui/Switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/Tabs"
import { Separator } from "@components/ui/Separator"
import { cn } from "@lib/utils"

export function AdminSettingsPage() {
  const [general, setGeneral] = React.useState({ storeName: "FreshCart Supermarket", email: "hello@freshcart.ng", phone: "+234 800 373 7427", address: "12 Marina Road, Lagos Island, Lagos", timezone: "Africa/Lagos", currency: "NGN" })
  const [notifications, setNotifications] = React.useState({ emailOrders: true, emailLowStock: true, smsDelivery: false, pushPromos: true, pushOrders: true })
  const [payments, setPayments] = React.useState({ paystackEnabled: true, paystackPublicKey: "pk_test_...", paystackSecretKey: "sk_test_...", bankTransferEnabled: true, codEnabled: true, minCodAmount: 5000 })
  const [delivery, setDelivery] = React.useState({ freeThreshold: 50000, expressFee: 2000, standardFee: 1500, areas: ["Victoria Island", "Lekki", "Ikoyi", "Ikeja", "Yaba", "Surulere", "Ogudu"] })
  const [security, setSecurity] = React.useState({ twoFactor: true, sessionTimeout: 30, passwordMinLength: 8, loginAttempts: 5 })

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "delivery", label: "Delivery", icon: Truck },
    { id: "security", label: "Security", icon: Shield },
  ]

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
        <p className="mt-1 text-sm text-navy-500">Configure your FreshCart supermarket settings.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map(t => (
            <TabsTrigger key={t.id} value={t.id} className="flex items-center justify-center gap-2 py-3">
              <t.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <h2 className="text-lg font-semibold text-navy-900">Store Information</h2>
          <div className="space-y-4">
            <div><Label htmlFor="storeName">Store Name</Label><Input id="storeName" value={general.storeName} onChange={e => setGeneral({...general, storeName: e.target.value})} /></div>
            <div><Label htmlFor="email">Contact Email</Label><Input id="email" type="email" value={general.email} onChange={e => setGeneral({...general, email: e.target.value})} /></div>
            <div><Label htmlFor="phone">Contact Phone</Label><Input id="phone" type="tel" value={general.phone} onChange={e => setGeneral({...general, phone: e.target.value})} /></div>
            <div><Label htmlFor="address">Address</Label><textarea id="address" value={general.address} onChange={e => setGeneral({...general, address: e.target.value})} className="w-full rounded-md border border-navy-200 p-2 text-sm focus:border-fresh-500" rows={2} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="timezone">Timezone</Label><Select value={general.timezone} onValueChange={v => setGeneral({...general, timezone: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Africa/Lagos">Africa/Lagos</SelectItem><SelectItem value="UTC">UTC</SelectItem></SelectContent></Select></div>
              <div><Label htmlFor="currency">Currency</Label><Select value={general.currency} onValueChange={v => setGeneral({...general, currency: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NGN">NGN (₦)</SelectItem><SelectItem value="USD">USD ($)</SelectItem></SelectContent></Select></div>
            </div>
          </div>
          <Separator />
          <Button onClick={() => alert("Saved (demo)")}><Save className="h-4 w-4" /> Save General Settings</Button>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <h2 className="text-lg font-semibold text-navy-900">Notification Preferences</h2>
          {[
            { key: "emailOrders", label: "Email: New Orders", desc: "Receive email for every new order" },
            { key: "emailLowStock", label: "Email: Low Stock Alerts", desc: "Daily summary of low-stock products" },
            { key: "smsDelivery", label: "SMS: Delivery Updates", desc: "Send SMS to customers on delivery status changes" },
            { key: "pushPromos", label: "Push: Promotions", desc: "Notify customers of deals and coupons" },
            { key: "pushOrders", label: "Push: Order Updates", desc: "Real-time order status notifications" },
          ].map(n => (
            <label key={n.key} className="flex items-center justify-between p-3 rounded-lg border border-navy-100 hover:bg-navy-50">
              <div><p className="font-medium text-navy-900">{n.label}</p><p className="text-sm text-navy-500">{n.desc}</p></div>
              <Switch checked={notifications[n.key as keyof typeof notifications]} onCheckedChange={checked => setNotifications({...notifications, [n.key]: checked})} />
            </label>
          ))}
          <Button onClick={() => alert("Saved (demo)")}><Save className="h-4 w-4" /> Save Notification Settings</Button>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <h2 className="text-lg font-semibold text-navy-900">Payment Configuration</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-navy-100"><div><p className="font-medium text-navy-900">Paystack</p><p className="text-sm text-navy-500">Online card payments</p></div><Switch checked={payments.paystackEnabled} onCheckedChange={checked => setPayments({...payments, paystackEnabled: checked})} /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="paystackPublicKey">Paystack Public Key</Label><Input id="paystackPublicKey" value={payments.paystackPublicKey} onChange={e => setPayments({...payments, paystackPublicKey: e.target.value})} /></div><div><Label htmlFor="paystackSecretKey">Paystack Secret Key</Label><Input id="paystackSecretKey" type="password" value={payments.paystackSecretKey} onChange={e => setPayments({...payments, paystackSecretKey: e.target.value})} /></div></div>
            <Separator />
            <div className="flex items-center justify-between p-3 rounded-lg border border-navy-100"><div><p className="font-medium text-navy-900">Bank Transfer</p><p className="text-sm text-navy-500">Offline bank transfer payments</p></div><Switch checked={payments.bankTransferEnabled} onCheckedChange={checked => setPayments({...payments, bankTransferEnabled: checked})} /></div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-navy-100"><div><p className="font-medium text-navy-900">Pay on Delivery</p><p className="text-sm text-navy-500">Cash or card on delivery</p></div><Switch checked={payments.codEnabled} onCheckedChange={checked => setPayments({...payments, codEnabled: checked})} /></div>
            <div><Label htmlFor="minCodAmount">Minimum COD Amount (₦)</Label><Input id="minCodAmount" type="number" value={payments.minCodAmount} onChange={e => setPayments({...payments, minCodAmount: Number(e.target.value)})} /></div>
          </div>
          <Button onClick={() => alert("Saved (demo)")}><Save className="h-4 w-4" /> Save Payment Settings</Button>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <h2 className="text-lg font-semibold text-navy-900">Delivery Settings</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="freeThreshold">Free Delivery Threshold (₦)</Label><Input id="freeThreshold" type="number" value={delivery.freeThreshold} onChange={e => setDelivery({...delivery, freeThreshold: Number(e.target.value)})} /></div>
            <div><Label htmlFor="expressFee">Express Fee (₦)</Label><Input id="expressFee" type="number" value={delivery.expressFee} onChange={e => setDelivery({...delivery, expressFee: Number(e.target.value)})} /></div>
            <div><Label htmlFor="standardFee">Standard Fee (₦)</Label><Input id="standardFee" type="number" value={delivery.standardFee} onChange={e => setDelivery({...delivery, standardFee: Number(e.target.value)})} /></div>
          </div>
          <div><Label htmlFor="areas">Service Areas (comma-separated)</Label><textarea id="areas" value={delivery.areas.join(", ")} onChange={e => setDelivery({...delivery, areas: e.target.value.split(",").map(s => s.trim())})} className="w-full rounded-md border border-navy-200 p-2 text-sm focus:border-fresh-500" rows={2} /></div>
          <Button onClick={() => alert("Saved (demo)")}><Save className="h-4 w-4" /> Save Delivery Settings</Button>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <h2 className="text-lg font-semibold text-navy-900">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-navy-100"><div><p className="font-medium text-navy-900">Two-Factor Authentication</p><p className="text-sm text-navy-500">Require 2FA for all admin accounts</p></div><Switch checked={security.twoFactor} onCheckedChange={checked => setSecurity({...security, twoFactor: checked})} /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label><Input id="sessionTimeout" type="number" value={security.sessionTimeout} onChange={e => setSecurity({...security, sessionTimeout: Number(e.target.value)})} min="5" max="480" /></div><div><Label htmlFor="passwordMinLength">Minimum Password Length</Label><Input id="passwordMinLength" type="number" value={security.passwordMinLength} onChange={e => setSecurity({...security, passwordMinLength: Number(e.target.value)})} min="6" max="32" /></div><div><Label htmlFor="loginAttempts">Max Login Attempts</Label><Input id="loginAttempts" type="number" value={security.loginAttempts} onChange={e => setSecurity({...security, loginAttempts: Number(e.target.value)})} min="3" max="10" /></div></div>
          </div>
          <Button onClick={() => alert("Saved (demo)")}><Save className="h-4 w-4" /> Save Security Settings</Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
