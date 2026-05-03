import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from '../utils/api'

const ScannerContext = createContext(null)

export function ScannerProvider({ children }) {
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [isReturning, setIsReturning] = useState(false)
  const [isFromAppointment, setIsFromAppointment] = useState(false)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [settings, setSettings] = useState({
    cashbackPercent: 5,
    newCustomerCashbackPercent: 10,
    minBill: 100,
    maxCashback: 500,
    salonName: 'The Grommers',
    instagramUrl: 'https://www.instagram.com/thegroomerss/',
    facebookUrl: 'https://facebook.com/thegrommers',
    googleReviewUrl: 'https://g.page/thegrommers/review',
  })

  // Fetch live settings from API on mount
  useEffect(() => {
    fetch('/api/settings?action=get')
      .then(r => r.json())
      .then(data => {
        if (data.settings) setSettings(s => ({ ...s, ...data.settings }))
      })
      .catch(() => { /* use defaults */ })
  }, [])

  // Form data for new customers
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    instagramFollowed: false,
    facebookFollowed: false,
    googleReviewDone: false,
  })

  const [billAmount, setBillAmount] = useState('')

  const lookupPhone = useCallback(async (phoneNum) => {
    setLoading(true)
    setError(null)
    try {
      // Use the unified check endpoint (3-way lookup)
      const res = await fetch(`/api/customers?action=check&phone=${phoneNum}`)
      const data = await res.json()

      if (data.isReturning) {
        // Existing customer in Customers sheet
        setCustomer(data.customerData)
        setIsReturning(true)
        setIsFromAppointment(false)
        setStep('welcomeBack')
      } else if (data.fromAppointment) {
        // Found in Appointments — already auto-created in Customers
        setCustomer(data.customerData)
        setFormData(prev => ({
          ...prev,
          name:  data.customerData.name  || '',
          email: data.customerData.email || '',
        }))
        setIsReturning(false)
        setIsFromAppointment(true)
        setStep('appointmentWelcome')
      } else {
        // Not found — full onboarding
        setIsReturning(false)
        setIsFromAppointment(false)
        setStep('name')
      }
    } catch {
      // Demo / offline mode
      setIsReturning(false)
      setIsFromAppointment(false)
      setStep('name')
    } finally {
      setLoading(false)
    }
  }, [])

  const submitRegistration = useCallback(async () => {
    // Appointment customers are already saved during the check — skip re-registration
    if (isFromAppointment) return

    setLoading(true)
    try {
      await api.registerCustomer({
        phone,
        name:              formData.name,
        email:             formData.email,
        gender:            formData.gender,
        instagramFollowed: formData.instagramFollowed,
        facebookFollowed:  formData.facebookFollowed,
        googleReviewDone:  formData.googleReviewDone,
      })
    } catch {
      // Continue anyway in demo mode
    } finally {
      setLoading(false)
    }
  }, [phone, formData, isFromAppointment])

  const submitBill = useCallback(async () => {
    setLoading(true)
    try {
      const amount = parseFloat(billAmount)
      await api.processBill(phone, amount, !isReturning)
    } catch {
      // Continue in demo mode
    } finally {
      setLoading(false)
      setStep('cashback')
    }
  }, [phone, billAmount, isReturning])

  // Pick the right rate: new customers get newCustomerCashbackPercent, regulars get cashbackPercent
  const activeCashbackPercent = isReturning
    ? (settings.cashbackPercent || 5)
    : (settings.newCustomerCashbackPercent || settings.cashbackPercent || 10)

  const cashbackAmount = (() => {
    const bill = parseFloat(billAmount) || 0
    if (bill < settings.minBill) return 0
    const cb = (bill * activeCashbackPercent) / 100
    return settings.maxCashback ? Math.min(cb, settings.maxCashback) : cb
  })()

  const reset = useCallback(() => {
    setStep('phone')
    setPhone('')
    setIsReturning(false)
    setIsFromAppointment(false)
    setCustomer(null)
    setFormData({ name: '', email: '', gender: '', instagramFollowed: false, facebookFollowed: false, googleReviewDone: false })
    setBillAmount('')
    setError(null)
  }, [])

  return (
    <ScannerContext.Provider value={{
      step, setStep, phone, setPhone, isReturning, isFromAppointment, customer,
      loading, error, formData, setFormData, billAmount, setBillAmount,
      cashbackAmount, activeCashbackPercent, settings, lookupPhone, submitRegistration, submitBill, reset,
    }}>
      {children}
    </ScannerContext.Provider>
  )
}

export const useScanner = () => useContext(ScannerContext)
