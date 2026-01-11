import { Building2, LayoutDashboard, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-teal-600 border-b-4 border-blue-700 shadow-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Local Leads Hub</h1>
            <p className="text-sm text-blue-100">Business Dashboard</p>
          </div>
        </div>
        <nav className="flex items-center gap-3">
          <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white gap-2">
            <LayoutDashboard className="h-5 w-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white gap-2">
            <Settings className="h-5 w-5" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button
            variant="outline"
            className="bg-white/10 text-white border-2 border-white/30 hover:bg-white hover:text-blue-700 backdrop-blur-sm gap-2"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
