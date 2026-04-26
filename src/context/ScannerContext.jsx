import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from '../utils/api'

const ScannerContext = createContext(null)

const STEPS = ['phone', 'lookup', 'name', 'email', 'social', 'review', 'bill', 'cashback']

export function ScannerProvider({ children }) {
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [isReturning, setIsReturning] = useState(false)
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
      const res = await api.lookupPhone(phoneNum)
      if (res.found) {
        setCustomer(res.customer)
        setIsReturning(true)
        setStep('welcomeBack')
      } else {
        setIsReturning(false)
        setStep('name')
      }
    } catch (err) {
      // Demo mode: simulate not found
      setIsReturning(false)
      setStep('name')
    } finally {
      setLoading(false)
    }
  }, [])

  const submitRegistration = useCallback(async () => {
    setLoading(true)
    try {
      await api.registerCustomer({
        phone,
        name: formData.name,
        email: formData.email,
        gender: formData.gender,
        instagramFollowed: formData.instagramFollowed,
        facebookFollowed: formData.facebookFollowed,
        googleReviewDone: formData.googleReviewDone,
      })
    } catch (err) {
      // Continue anyway in demo mode
    } finally {
      setLoading(false)
    }
  }, [phone, formData])

  const submitBill = useCallback(async () => {
    setLoading(true)
    try {
      const amount = parseFloat(billAmount)
      await api.processBill(phone, amount, !isReturning)
    } catch (err) {
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
    setCustomer(null)
    setFormData({ name: '', email: '', gender: '', instagramFollowed: false, facebookFollowed: false, googleReviewDone: false })
    setBillAmount('')
    setError(null)
  }, [])

  return (
    <ScannerContext.Provider value={{
      step, setStep, phone, setPhone, isReturning, customer,
      loading, error, formData, setFormData, billAmount, setBillAmount,
      cashbackAmount, activeCashbackPercent, settings, lookupPhone, submitRegistration, submitBill, reset,
    }}>
      {children}
    </ScannerContext.Provider>
  )
}

export const useScanner = () => useContext(ScannerContext)
