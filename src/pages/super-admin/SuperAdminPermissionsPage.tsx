import { Shield, User, Users, Settings, Check, ChevronRight, ChevronLeft } from "lucide-react"
import { Badge } from "@components/ui/Badge"
import { permissionMatrix } from "@data/admin"
import { cn } from "@lib/utils"

export function SuperAdminPermissionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Permissions Management</h1>
        <p className="mt-1 text-sm text-navy-400">Manage role-based access control for the platform.</p>
      </div>

      <div className="rounded-lg border border-navy-800 bg-navy-950 p-6">
        <h2 className="text-lg font-semibold text-white">Role Permissions Matrix</h2>
        <p className="mt-1 text-sm text-navy-400">Define what each role can access in the system.</p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm font-semibold text-navy-300 border-b border-navy-800">
                <th className="p-3 w-32">Permission</th>
                {permissionMatrix.map(r => (
                  <th key={r.role} className="p-3 text-center"><Badge variant="default">{r.role}</Badge></th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {permissionMatrix[0].permissions.map((perm, i) => (
                <tr key={perm} className="hover:bg-navy-900/50">
                  <td className="p-3 font-medium text-navy-300">{perm}</td>
                  {permissionMatrix.map(r => (
                    <td key={r.role} className="p-3 text-center">
                      <Badge variant={r.permissions.includes(perm) ? "success" : "default"}>{r.permissions.includes(perm) ? "✓" : "✗"}</Badge>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-navy-800 bg-navy-950 p-6">
        <h2 className="text-lg font-semibold text-white">Custom Role Builder</h2>
        <p className="mt-1 text-sm text-navy-400">Create custom roles with specific permissions.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {permissionMatrix[0].permissions.map(perm => (
            <label key={perm} className="flex items-center gap-2 p-3 rounded-lg border border-navy-800 hover:bg-navy-900 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded border-navy-600 text-fresh-500 focus:ring-fresh-500" />
              <span className="text-sm text-white">{perm}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
