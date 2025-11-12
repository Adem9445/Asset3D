import { useState } from 'react'
import { ChevronUp, ChevronDown, Layers, Plus, Edit2, Check, X } from 'lucide-react'

const FloorNavigator = ({ 
  floors, 
  selectedFloor, 
  onFloorSelect, 
  onFloorAdd, 
  onFloorEdit,
  onFloorDelete,
  currentRoom
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [editingFloor, setEditingFloor] = useState(null)
  const [editName, setEditName] = useState('')

  const startEdit = (floor, e) => {
    e.stopPropagation()
    setEditingFloor(floor.id)
    setEditName(floor.name)
  }

  const saveEdit = (floorId) => {
    if (editName.trim()) {
      onFloorEdit(floorId, { name: editName.trim() })
    }
    setEditingFloor(null)
  }

  const cancelEdit = () => {
    setEditingFloor(null)
    setEditName('')
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Layers size={18} />
          Etasjer
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onFloorAdd}
            className="p-1 hover:bg-gray-100 rounded"
            title="Legg til etasje"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-1">
          {floors.map((floor, index) => (
            <div
              key={floor.id}
              onClick={() => onFloorSelect(floor)}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                selectedFloor?.id === floor.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              {editingFloor === floor.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(floor.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="flex-1 px-2 py-1 text-sm border rounded"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      saveEdit(floor.id)
                    }}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      cancelEdit()
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{floor.name}</div>
                    <div className="text-xs text-gray-500">
                      {floor.rooms?.length || 0} rom
                    </div>
                  </div>
                  <button
                    onClick={(e) => startEdit(floor, e)}
                    className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {currentRoom && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs text-gray-500">Aktivt rom:</div>
          <div className="text-sm font-medium">{currentRoom.name}</div>
        </div>
      )}
    </div>
  )
}

export default FloorNavigator
