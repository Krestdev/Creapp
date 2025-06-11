"use client"

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const Page = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/tableau-de-bord/projets/creer-un-projet')
  }, [router])

  return null
}

export default Page
