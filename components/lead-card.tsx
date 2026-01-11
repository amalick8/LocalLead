import { Lock, Mail, Phone, MapPin, Clock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LeadCardProps {
  service: string
  city: string
  timestamp: string
  isLocked: boolean
  description?: string
  contact?: string
  phone?: string
}

const getServiceColor = (service: string) => {
  const colors: Record<string, string> = {
    Plumbing: "bg-blue-100 text-blue-700 border-blue-200",
    Electrical: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Landscaping: "bg-green-100 text-green-700 border-green-200",
    Cleaning: "bg-pink-100 text-pink-700 border-pink-200",
    HVAC: "bg-cyan-100 text-cyan-700 border-cyan-200",
    Roofing: "bg-red-100 text-red-700 border-red-200",
    Painting: "bg-purple-100 text-purple-700 border-purple-200",
  }
  return colors[service] || "bg-gray-100 text-gray-700 border-gray-200"
}

export function LeadCard({ service, city, timestamp, isLocked, description, contact, phone }: LeadCardProps) {
  return (
    <Card
      className={`border-2 shadow-lg transition-all hover:shadow-xl ${
        isLocked ? "border-gray-200 bg-white" : "border-green-200 bg-gradient-to-br from-white to-green-50"
      }`}
    >
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <Badge className={`${getServiceColor(service)} border-2 font-bold text-base px-3 py-1`}>{service}</Badge>
            <div className="flex items-center gap-2 text-base text-gray-600">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="font-medium">{city}</span>
            </div>
          </div>
          {isLocked ? (
            <Badge variant="secondary" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2">
              <Lock className="h-4 w-4" />
              <span className="font-semibold">Locked</span>
            </Badge>
          ) : (
            <Badge className="flex items-center gap-2 bg-green-600 text-white px-3 py-2">
              <Unlock className="h-4 w-4" />
              <span className="font-semibold">Unlocked</span>
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          {timestamp}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-base leading-relaxed text-gray-700 font-medium">{description}</p>

        {isLocked ? (
          <div className="mt-4 space-y-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 p-5 border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="blur-sm text-gray-500 font-medium">contact@email.com</span>
              <Lock className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <span className="blur-sm text-gray-500 font-medium">(555) 123-4567</span>
              <Lock className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
            <p className="text-sm text-gray-600 text-center pt-2 border-t border-gray-300">
              Unlock to view contact details
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-5 border-2 border-green-300 shadow-sm">
            {contact && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-600" />
                <a
                  href={`mailto:${contact}`}
                  className="text-gray-900 font-medium hover:text-green-600 transition-colors"
                >
                  {contact}
                </a>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-600" />
                <a href={`tel:${phone}`} className="text-gray-900 font-medium hover:text-green-600 transition-colors">
                  {phone}
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>
      {isLocked && (
        <CardFooter className="border-t-2 border-gray-200 pt-4 bg-gradient-to-b from-white to-gray-50">
          <Button className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
            <Unlock className="mr-2 h-5 w-5" />
            Unlock Lead for $25
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
