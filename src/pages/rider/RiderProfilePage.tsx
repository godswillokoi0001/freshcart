import * as React from "react"
import { useNavigate } from "react-router-dom"
import { User, Mail, Lock, Shield, MapPin, LogOut, CreditCard } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import { Avatar, AvatarFallback } from "@components/ui/Avatar"
import { Separator } from "@components/ui/Separator"
import { useAuth } from "@context/AuthContext"
import { riders } from "@data/people"
import { cn } from "@lib/utils"

export function RiderProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = React.useState(false)
  const me = riders.find((r) => r.name === user?.name) || riders[0]
  const [profile, setProfile] = React.useState({ name: me.name, email: me.email, phone: me.phone, vehicle: me.vehicle })

  const handleSave = () => { setEditing(false); success("Profile updated", "Your profile has been updated locally.") }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-fresh-100 text-2xl font-semibold text-fresh-700">
            {me.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{editing ? <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="bg-transparent border-0 p-0" /> : me.name}</h1>
          <p className="text-sm text-navy-500">Rider · {me.status}</p>
        </div>
        {editing ? <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button> : <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit Profile</Button>}
      </div>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-navy-900">Contact & Vehicle</h2>
        <div className="grid gap-4">
          <div><Label htmlFor="email">Email</Label><Input id="email" value={editing ? profile.email : me.email} onChange={(e) => setProfile({...profile, email: e.target.value})} disabled={!editing} /></div>
          <div><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" value={editing ? profile.phone : me.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} disabled={!editing} /></div>
          <div><Label htmlFor="vehicle">Vehicle</Label><Input id="vehicle" value={editing ? profile.vehicle : me.vehicle} onChange={(e) => setProfile({...profile, vehicle: e.target.value})} disabled={!editing} /></div>
        </div>
        {editing && <Button onClick={handleSave} className="w-full">Save Changes</Button>}
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-navy-900">Earnings Summary</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-navy-200 bg-white p-4"><dt className="text-sm text-navy-500">Today</dt><dd className="mt-1 text-2xl font-bold text-navy-900">₦9,500</dd></div>
          <div className="rounded-lg border border-navy-200 bg-white p-4"><dt className="text-sm text-navy-500">This Week</dt><dd className="mt-1 text-2xl font-bold text-navy-900">₦61,200</dd></div>
          <div className="rounded-lg border border-navy-200 bg-white p-4"><dt className="text-sm text-navy-500">This Month</dt><dd className="mt-1 text-2xl font-bold text-navy-900">₦245,800</dd></div>
          <div className="rounded-lg border border-navy-200 bg-white p-4"><dt className="text-sm text-navy-500">Total</dt><dd className="mt-1 text-2xl font-bold text-navy-900">₦1,847,200</dd></div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-navy-900">Account & Security</h2>
        <div className="grid gap-3">
          <Button variant="outline" className="justify-start gap-3"><Lock className="h-4 w-4" /> Change Password</Button>
          <Button variant="outline" className="justify-start gap-3"><Shield className="h-4 w-4" /> Two-Factor Authentication</Button>
          <Button variant="outline" className="justify-start gap-3"><MapPin className="h-4 w-4" /> Default Pickup Location</Button>
          <Button variant="outline" className="justify-start gap-3"><CreditCard className="h-4 w-4" /> Bank Account Details</Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-navy-900">Performance</h2>
        <dl className="rounded-lg border border-navy-200 bg-white p-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-navy-500">Total Deliveries</dt><dd className="font-medium text-navy-900">486</dd></div>
          <div className="flex justify-between"><dt className="text-navy-500">Rating</dt><dd className="font-medium text-navy-900">4.8 ★</dd></div>
          <div className="flex justify-between"><dt className="text-navy-500">On-time Rate</dt><dd className="font-medium text-navy-900">97%</dd></div>
          <div className="flex justify-between"><dt className="text-navy-500">Cancellation Rate</dt><dd className="font-medium text-navy-900">1.2%</dd></div>
          <div className="flex justify-between"><dt className="text-navy-500">Joined</dt><dd className="font-medium text-navy-900">Jun 2, 2025</dd></div>
        </dl>
      </section>

      <Separator />

      <Button variant="outline" className="w-full text-danger-600 hover:bg-danger-50" onClick={() => { signOut(); navigate("/sign-in") }}>
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>
    </div>
  )
}
