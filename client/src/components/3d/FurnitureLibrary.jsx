import React, { useState } from 'react'
import {
    Armchair,
    Monitor,
    Printer,
    Phone,
    FileText,
    Trash2,
    Coffee,
    Utensils,
    Wind,
    Zap,
    Box
} from 'lucide-react'

const categories = [
    {
        id: 'office',
        name: 'Kontor',
        items: [
            { type: 'desk', name: 'Skrivebord', icon: Box },
            { type: 'chair', name: 'Kontorstol', icon: Armchair },
            { type: 'bookshelf', name: 'Bokhylle', icon: FileText },
            { type: 'meetingTable', name: 'Møtebord', icon: Box },
            { type: 'whiteboard', name: 'Whiteboard', icon: Monitor },
            { type: 'filingCabinet', name: 'Arkivskap', icon: FileText },
            { type: 'trashBin', name: 'Søppelbøtte', icon: Trash2 },
        ]
    },
    {
        id: 'electronics',
        name: 'Elektronikk',
        items: [
            { type: 'computer', name: 'Datamaskin', icon: Monitor },
            { type: 'printer', name: 'Skriver', icon: Printer },
            { type: 'phone', name: 'Telefon', icon: Phone },
        ]
    },
    {
        id: 'kitchen',
        name: 'Kjøkken',
        items: [
            { type: 'coffeeMachine', name: 'Kaffemaskin', icon: Coffee },
            { type: 'microwave', name: 'Mikrobølgeovn', icon: Zap },
            { type: 'refrigerator', name: 'Kjøleskap', icon: Box },
            { type: 'waterCooler', name: 'Vannkjøler', icon: Coffee },
            { type: 'dishwasher', name: 'Oppvaskmaskin', icon: Utensils },
        ]
    },
    {
        id: 'lounge',
        name: 'Lounge',
        items: [
            { type: 'sofa', name: 'Sofa', icon: Armchair },
            { type: 'plant', name: 'Plante', icon: Wind },
        ]
    }
]

const DraggableItem = ({ type, name, icon: Icon }) => {
    const handleDragStart = (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ type, name }))
        e.dataTransfer.effectAllowed = 'copy'
    }

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="flex flex-col items-center justify-center p-3 bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-blue-500 cursor-grab active:cursor-grabbing transition-all"
        >
            <div className="mb-2 text-gray-600">
                <Icon size={24} />
            </div>
            <span className="text-xs font-medium text-center text-gray-700">{name}</span>
        </div>
    )
}

const FurnitureLibrary = () => {
    const [activeCategory, setActiveCategory] = useState('office')

    return (
        <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200 w-64">
            <div className="p-4 border-b bg-white">
                <h3 className="font-semibold text-gray-800">Møbelkatalog</h3>
                <p className="text-xs text-gray-500 mt-1">Dra og slipp møbler inn i rommet</p>
            </div>

            {/* Categories */}
            <div className="flex overflow-x-auto p-2 gap-2 border-b bg-white scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${activeCategory === cat.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-3">
                    {categories
                        .find(c => c.id === activeCategory)
                        ?.items.map(item => (
                            <DraggableItem key={item.type} {...item} />
                        ))}
                </div>
            </div>
        </div>
    )
}

export default FurnitureLibrary
