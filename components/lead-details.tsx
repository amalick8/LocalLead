"use client"

import { useState } from "react"
import { ArrowLeft, Lock, Mail, Phone, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaymentModal } from "@/components/payment-modal"

interface Lead {
  id: string
  service: string
  city: string
  timestamp: string
  isLocked: boolean
  description: string
  contact?: string
  phone?: string
}

interface LeadDetailsProps {
  lead: Lead
}

export function LeadDetails({ lead }: LeadDetailsProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(!lead.isLocked)

  const handleUnlock = () => {
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = () => {
    setIsUnlocked(true)
    setIsPaymentModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-4 border-b border-slate-200 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold text-slate-900">{lead.service} Request</CardTitle>
            </div>
            <Badge variant={isUnlocked ? "default" : "secondary"} className="flex items-center gap-1">
              {!isUnlocked && <Lock className="h-3 w-3" />}
              {isUnlocked ? "Unlocked" : "Locked"}
            </Badge>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4" />
              {lead.city}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="h-4 w-4" />
              {lead.timestamp}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Description</h3>
            <p className="leading-relaxed text-slate-700">{lead.description}</p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Contact Information</h3>
            {isUnlocked ? (
              <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-slate-700">Email</div>
                    <a href={`mailto:${lead.contact}`} className="text-green-700 hover:underline">
                      {lead.contact}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-slate-700">Phone</div>
                    <a href={`tel:${lead.phone}`} className="text-green-700 hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3 rounded-lg bg-slate-100 p-4">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Mail className="h-5 w-5" />
                    <span className="blur-sm">contact@email.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Phone className="h-5 w-5" />
                    <span className="blur-sm">(555) 123-4567</span>
                  </div>
                </div>
                <Button onClick={handleUnlock} size="lg" className="w-full">
                  <Lock className="mr-2 h-4 w-4" />
                  Unlock Lead for $25
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={25}
      />
    </div>
  )
}
