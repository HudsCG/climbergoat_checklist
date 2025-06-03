"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"

interface LoginFormProps {
  isLoading: boolean
  onSubmit: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ isLoading, onSubmit }) => {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Verificar estado inicial
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      {!isOnline && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          <p>Você está offline. É necessário estar conectado à internet para fazer login.</p>
        </div>
      )}
      <div className="grid gap-4">
        <div className="space-y-2">
          {/* Your form fields here.  Example: */}
          {/* <Label htmlFor="email">Email</Label>
          <Input id="email" placeholder="m@example.com" type="email" /> */}
        </div>
        <Button type="submit" disabled={isLoading || !isOnline} className="w-full">
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </div>
    </form>
  )
}

export default LoginForm
