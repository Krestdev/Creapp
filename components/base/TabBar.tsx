import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import React from 'react'
import { Button } from '../ui/button'

export interface TabProps {
    tabs: { id: number, title: string, badge?: number }[]
    setSelectedTab: (value: React.SetStateAction<number>) => void
    selectedTab: number;
    className?:string;
}

export const TabBar = ({ tabs, setSelectedTab, selectedTab, className="" }: TabProps) => {
    return (
        <div className={cn("w-fit flex border rounded overflow-hidden", className)}>
            {tabs.sort((a,b)=> a.id - b.id).map(x => {
                return (
                    <div
                        onClick={() => setSelectedTab(x.id)}
                        className={`py-1 px-4 h-9 flex items-center cursor-pointer gap-2 text-sm hover:bg-gray-100 transition-all duration-300 ease-out ${x.id === selectedTab && "bg-accent text-default hover:bg-accent/80! font-semibold"}`}
                        key={x.id}>
                        <p>{x.title}</p>
                        {x.badge ? x.badge > 0 && <div className={`px-2 rounded ${x.id === selectedTab ? "bg-white text-black" : "bg-primary text-white"}`}>
                            <p>{x.badge}</p>
                        </div> : null}
                    </div>
                )
            })}
        </div>
    )
}
