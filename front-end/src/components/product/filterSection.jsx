import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react"



export default function FilterSection ({title , children}) {

    const [open , setOpen] = useState(false);

    return (
        <div className="border-b border-gray-100 py-3 last:border-b-0">
            <button 
                className="flex items-center justify-between w-full cursor-pointer group"
                onClick={() => setOpen(op => !op)}
                >
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">
                        {title}
                    </span>

                    {open ? (
                        <ChevronUp size={13} className="text-gray-300" />
                    ):(
                        <ChevronDown size={13} className="text-gray-300" />
                    )}
            </button>
            {open && <div className="mt-2.5">{children}</div>}
        </div>
    )
}