import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import React from 'react'
import { Button } from '../ui/button'

interface Props {
    tabs: { id: number, title: string, badge?: number }[]
    setSelectedTab: (value: React.SetStateAction<number>) => void
    selectedTab: number
}

export const TabBar = ({ tabs, setSelectedTab, selectedTab }: Props) => {
    return (
        <div className="flex flex-row gap-4">
            {tabs.map(x => {
                return (
                    <div
                        onClick={() => setSelectedTab(x.id)}
                        className={`py-2 px-4 rounded-[8px] h-12 flex items-center cursor-pointer gap-2 ${x.id === selectedTab ? "bg-amber-400 text-black hover:bg-amber-400 hover:text-black" : "border"}`}
                        key={x.id}>
                        <p>{x.title}</p>
                        {x.badge ? x.badge > 0 && <div className={`px-2 rounded-[8px] ${x.id === selectedTab ? "bg-white text-black" : "bg-primary text-white"}`}>
                            <p>{x.badge}</p>
                        </div> : null}
                    </div>
                )
            })}
        </div>
    )
}
