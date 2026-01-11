"use client"

import { useState } from "react"
import { CreditCard, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  amount: number
}

export function PaymentModal({ isOpen, onClose, onSuccess, amount }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handlePayment = () => {
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
        setIsSuccess(false)
      }, 1500)
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">Unlock Lead</DialogTitle>
              <DialogDescription className="text-slate-600">
                Get full access to the customer's contact information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                <span className="text-sm font-medium text-slate-700">Lead Price</span>
                <span className="text-2xl font-semibold text-slate-900">${amount}</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p>• Instant access to customer contact details</p>
                <p>• Direct phone and email information</p>
                <p>• Secure payment processing</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={isProcessing} className="gap-2">
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Pay ${amount}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Payment Successful!</h3>
            <p className="mt-2 text-sm text-slate-600">Lead unlocked successfully</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
