import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import React from 'react'
import { Button } from '../ui/button'

interface Props {
    tabs: { id: number, title: string }[]
    setSelectedTab: (value: React.SetStateAction<number>) => void
    selectedTab: number
}

export const TabBar = ({ tabs, setSelectedTab, selectedTab }: Props) => {
    return (
        <div className="flex flex-row gap-4">
            {tabs.map(x => {
                return (
                    <Button onClick={() => setSelectedTab(x.id)} variant={x.id === selectedTab ? "primary" : "outline"} className={`rounded-[8px] h-12 ${x.id === selectedTab ? "bg-amber-400 text-black hover:bg-amber-400 hover:text-black" : ""}`} key={x.id}>{x.title}</Button>
                )
            })}
        </div>
    )
}
