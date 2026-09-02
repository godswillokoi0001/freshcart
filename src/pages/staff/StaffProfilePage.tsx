import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Pencil, User, Mail, Lock, Shield, LogOut } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import { Avatar, AvatarFallback } from "@components/ui/Avatar"
import { Separator } from "@components/ui/Separator"
import { useAuth } from "@context/AuthContext"
import { staff } from "@data/people"
import { cn } from "@lib/utils"

export function StaffProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = React.useState(false)
  const me = staff.find((s) => s.name === user?.name) || staff[0]
  const [profile, setProfile] = React.useState({ name: me.name, email: me.email, phone: "+234 803 555 0000" })

  const handleSave = () => {
    setEditing(false)
    success("Profile updated", "Your profile has been updated locally.")
  }

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
          <p className="text-sm text-navy-500">Staff Member · {me.role}</p>
        </div>
        {editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(false)}><Pencil className="h-4 w-4" /> Cancel</Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> Edit Profile</Button>
        )}
      </div>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-navy-900">Contact Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={editing ? profile.email : me.email} onChange={(e) => setProfile({...profile, email: e.target.value})} disabled={!editing} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={editing ? profile.phone : "+234 803 555 0000"} onChange={(e) => setProfile({...profile, phone: e.target.value})} disabled={!editing} />
          </div>
        </div>
        {editing && <Button onClick={handleSave} className="w-full">Save Changes</Button>}
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-navy-900">Security</h2>
        <div className="grid gap-3">
          <Button variant="outline" className="justify-start gap-3">
            <Lock className="h-4 w-4" /> Change Password
          </Button>
          <Button variant="outline" className="justify-start gap-3">
            <Shield className="h-4 w-4" /> Two-Factor Authentication
          </Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-navy-900">Activity</h2>
        <div className="rounded-lg border border-navy-200 bg-white p-4">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-navy-500">Last Active</dt><dd className="font-medium text-navy-900">{me.lastActive}</dd></div>
            <div className="flex justify-between"><dt className="text-navy-500">Orders Fulfilled</dt><dd className="font-medium text-navy-900">{me.ordersFulfilled}</dd></div>
            <div className="flex justify-between"><dt className="text-navy-500">Role</dt><dd className="font-medium text-navy-900">{me.role}</dd></div>
            <div className="flex justify-between"><dt className="text-navy-500">Status</dt><dd className="font-medium text-navy-900">{me.status}</dd></div>
          </dl>
        </div>
      </section>

      <Separator />

      <Button variant="outline" className="w-full text-danger-600 hover:bg-danger-50" onClick={() => { signOut(); navigate("/sign-in") }}>
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>
    </div>
  )
}
