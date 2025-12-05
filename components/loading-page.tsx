import { Loader2 } from 'lucide-react'
import React from 'react'

function LoadingPage() {
  return (
    <div className="w-full min-h-[60vh] h-full grid place-items-center">
        <Loader2 size={20} className="animate-spin" />
      </div>
  )
}

export default LoadingPage