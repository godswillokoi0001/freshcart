import React from "react"
import { useToast } from "@context/ToastContext"
import { Globe, Shield, Database, Server, Save, Loader2, Bell, CreditCard, Mail, Key } from "lucide-react"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import { Switch } from "@components/ui/Switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/Select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/Tabs"
import { Separator } from "@components/ui/Separator"
import { cn } from "@lib/utils"

export function SuperAdminSystemSettingsPage() {
  const { success } = useToast()
  const [general, setGeneral] = React.useState({ platformName: "FreshCart", supportEmail: "support@freshcart.ng", defaultLanguage: "en", maintenanceMode: false, debugMode: false })
  const [database, setDatabase] = React.useState({ host: "localhost", port: 5432, name: "freshcart", ssl: true, poolSize: 20 })
  const [api, setApi] = React.useState({ rateLimit: 100, corsOrigins: "https://freshcart.ng, https://admin.freshcart.ng", webhookSecret: "whsec_...", version: "v1" })
  const [email, setEmail] = React.useState({ provider: "resend", fromEmail: "noreply@freshcart.ng", apiKey: "re_...", templatesPath: "/templates" })
  const [storage, setStorage] = React.useState({ provider: "supabase", bucket: "freshcart-assets", cdnUrl: "https://cdn.freshcart.ng", maxFileSize: 10 })
  const [security, setSecurity] = React.useState({ jwtSecret: "jwt_secret_...", jwtExpiry: "24h", passwordMinLength: 8, sessionTimeout: 30, maxLoginAttempts: 5 })

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "database", label: "Database", icon: Database },
    { id: "api", label: "API", icon: Server },
    { id: "email", label: "Email", icon: Mail },
    { id: "storage", label: "Storage", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
  ]

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="mt-1 text-sm text-navy-400">Configure platform-wide system settings.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {tabs.map(t => (
            <TabsTrigger key={t.id} value={t.id} className="flex items-center justify-center gap-2 py-3">
              <t.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Platform Settings</h2>
          <div className="space-y-4">
            <div><Label htmlFor="platformName">Platform Name</Label><Input id="platformName" value={general.platformName} onChange={e => setGeneral({...general, platformName: e.target.value})} className="bg-navy-900 border-navy-700" /></div>
            <div><Label htmlFor="supportEmail">Support Email</Label><Input id="supportEmail" type="email" value={general.supportEmail} onChange={e => setGeneral({...general, supportEmail: e.target.value})} className="bg-navy-900 border-navy-700" /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="defaultLanguage">Default Language</Label><Select value={general.defaultLanguage} onValueChange={v => setGeneral({...general, defaultLanguage: v})}><SelectTrigger className="bg-navy-900 border-navy-700"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="yo">Yoruba</SelectItem><SelectItem value="ig">Igbo</SelectItem><SelectItem value="ha">Hausa</SelectItem></SelectContent></Select></div></div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-navy-800"><div><p className="font-medium text-white">Maintenance Mode</p><p className="text-sm text-navy-400">Disable all customer-facing features</p></div><Switch checked={general.maintenanceMode} onCheckedChange={checked => setGeneral({...general, maintenanceMode: checked})} /></div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-navy-800"><div><p className="font-medium text-white">Debug Mode</p><p className="text-sm text-navy-400">Enable verbose logging</p></div><Switch checked={general.debugMode} onCheckedChange={checked => setGeneral({...general, debugMode: checked})} /></div>
          </div>
          <Button onClick={() => success("Settings saved", "General settings have been updated.")}><Save className="h-4 w-4" /> Save General Settings</Button>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Database Configuration</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="dbHost">Host</Label><Input id="dbHost" value={database.host} onChange={e => setDatabase({...database, host: e.target.value})} className="bg-navy-900 border-navy-700" /></div>
              <div><Label htmlFor="dbPort">Port</Label><Input id="dbPort" type="number" value={database.port} onChange={e => setDatabase({...database, port: Number(e.target.value)})} className="bg-navy-900 border-navy-700" /></div>
              <div><Label htmlFor="dbName">Database Name</Label><Input id="dbName" value={database.name} onChange={e => setDatabase({...database, name: e.target.value})} className="bg-navy-900 border-navy-700" /></div>
              <div><Label htmlFor="dbPool">Pool Size</Label><Input id="dbPool" type="number" value={database.poolSize} onChange={e => setDatabase({...database, poolSize: Number(e.target.value)})} className="bg-navy-900 border-navy-700" /></div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-navy-800"><div><p className="font-medium text-white">SSL Connection</p><p className="text-sm text-navy-400">Enforce SSL for database connections</p></div><Switch checked={database.ssl} onCheckedChange={checked => setDatabase({...database, ssl: checked})} /></div>
          </div>
          <Button onClick={() => success("Settings saved", "Database settings have been updated.")}><Save className="h-4 w-4" /> Save Database Settings</Button>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <h2 className="text-lg font-semibold text-white">API Configuration</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="rateLimit">Rate Limit (req/min)</Label><Input id="rateLimit" type="number" value={api.rateLimit} onChange={e => setApi({...api, rateLimit: Number(e.target.value)})} className="bg-navy-900 border-navy-700" /></div>
              <div><Label htmlFor="version">API Version</Label><Select value={api.version} onValueChange={v => setApi({...api, version: v})}><SelectTrigger className="bg-navy-900 border-navy-700"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="v1">v1</SelectItem><SelectItem value="v2">v2 (beta)</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label htmlFor="corsOrigins">CORS Origins (comma-separated)</Label><Input id="corsOrigins" value={api.corsOrigins} onChange={e => setApi({...api, corsOrigins: e.target.value})} className="bg-navy-900 border-navy-700" /></div>
            <div><Label htmlFor="webhookSecret">Webhook Secret</Label><Input id="webhookSecret" type="password" value={api.webhookSecret} onChange={e => setApi({...api, webhookSecret: e.target.value})} className="bg-navy-900 border-navy-700" /></div>
          </div>
          <Button onClick={() => success("Settings saved", "API settings have been updated.")}><Save className="h-4 w-4" /> Save API Settings</Button>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Email Service</h2>
          <div className="space-y-4">
            <div><Label htmlFor="emailProvider">Provider</Label><Select value={email.provider} onValueChange={v => setEmail({...email, provider: v})}><SelectTrigger className="bg-navy-900 border-navy-700"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="resend">Resend</SelectItem><SelectItem value="sendgrid">SendGrid</SelectItem><SelectItem value="ses">AWS SES</SelectItem><SelectItem value="smtp">Custom SMTP</SelectItem></SelectContent></Select></div>
            <div><Label htmlFor="fromEmail">From Email</Label><Input id="fromEmail" type="email" value={email.fromEmail} onChange={e => setEmail({...email, fromEmail: e.target.value})} className="bg-navy-900 border-navy-700" /></div>
            <div><Label htmlFor="apiKey">API Key</Label><Input id="apiKey" type="password" value={email.apiKey} onChange={e => setEmail({...email, apiKey: e.target.value})} className="bg-navy-900 border-navy-700" /></div>
            <div><Label htmlFor="templatesPath">Templates Path</Label><Input id="templatesPath" value={email.templatesPath} onChange={e => setEmail({...email, templatesPath: e.target.value})} className="bg-navy-900 border-navy-700" /></div>
          </div>
          <Button onClick={() => success("Settings saved", "Email settings have been updated.")}><Save className="h-4 w-4" /> Save Email Settings</Button>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Storage & CDN</h2>
          <div className="space-y-4">
            <div><Label htmlFor="provider">Provider</Label><Select value={storage.provider} onValueChange={v => setStorage({...storage, provider: v})}><SelectTrigger className="bg-navy-900 border-navy-700"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="supabase">Supabase</SelectItem><SelectItem value="s3">AWS S3</SelectItem><SelectItem value="cloudinary">Cloudinary</SelectItem></SelectContent></Select></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="bucket">Bucket Name</Label><Input id="bucket" value={storage.bucket} onChange={e => setStorage({...storage, bucket: e.target.value})} className="bg-navy-900 border-navy-700" /></div><div><Label htmlFor="cdnUrl">CDN URL</Label><Input id="cdnUrl" value={storage.cdnUrl} onChange={e => setStorage({...storage, cdnUrl: e.target.value})} className="bg-navy-900 border-navy-700" /></div></div>
            <div><Label htmlFor="maxFileSize">Max File Size (MB)</Label><Input id="maxFileSize" type="number" value={storage.maxFileSize} onChange={e => setStorage({...storage, maxFileSize: Number(e.target.value)})} className="bg-navy-900 border-navy-700" /></div>
          </div>
          <Button onClick={() => success("Settings saved", "Storage settings have been updated.")}><Save className="h-4 w-4" /> Save Storage Settings</Button>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Security Settings</h2>
          <div className="space-y-4">
            <div><Label htmlFor="jwtSecret">JWT Secret</Label><Input id="jwtSecret" type="password" value={security.jwtSecret} onChange={e => setSecurity({...security, jwtSecret: e.target.value})} className="bg-navy-900 border-navy-700" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="jwtExpiry">JWT Expiry</Label><Select value={security.jwtExpiry} onValueChange={v => setSecurity({...security, jwtExpiry: v})}><SelectTrigger className="bg-navy-900 border-navy-700"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1h">1 Hour</SelectItem><SelectItem value="6h">6 Hours</SelectItem><SelectItem value="24h">24 Hours</SelectItem><SelectItem value="7d">7 Days</SelectItem></SelectContent></Select></div>
              <div><Label htmlFor="passwordMinLength">Password Min Length</Label><Input id="passwordMinLength" type="number" value={security.passwordMinLength} onChange={e => setSecurity({...security, passwordMinLength: Number(e.target.value)})} className="bg-navy-900 border-navy-700" /></div>
              <div><Label htmlFor="sessionTimeout">Session Timeout (min)</Label><Input id="sessionTimeout" type="number" value={security.sessionTimeout} onChange={e => setSecurity({...security, sessionTimeout: Number(e.target.value)})} className="bg-navy-900 border-navy-700" /></div>
              <div><Label htmlFor="maxLoginAttempts">Max Login Attempts</Label><Input id="maxLoginAttempts" type="number" value={security.maxLoginAttempts} onChange={e => setSecurity({...security, maxLoginAttempts: Number(e.target.value)})} className="bg-navy-900 border-navy-700" /></div>
            </div>
          </div>
          <Button onClick={() => success("Settings saved", "Security settings have been updated.")}><Save className="h-4 w-4" /> Save Security Settings</Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
