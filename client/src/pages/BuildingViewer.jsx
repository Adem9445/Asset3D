import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import BuildingView3D from '../components/3d/BuildingView3D'
import useBuildingStore from '../stores/buildingStore'
import useAssetStore from '../stores/assetStore'
import { AlertCircle, Building2, RefreshCw } from 'lucide-react'
import axios from 'axios'

const API_URL = '/api'

const BuildingViewer = () => {
    const { buildingId } = useParams()
    const {
        buildings,
        loading: buildingLoading,
        error: buildingError,
        fetchBuilding
    } = useBuildingStore()

    const { assets, fetchAssets } = useAssetStore()

    const [selectedRoom, setSelectedRoom] = useState(null)
    const [locationData, setLocationData] = useState(null)
    const [floors, setFloors] = useState([])
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch full location structure with floors and rooms
    useEffect(() => {
        const fetchLocationStructure = async () => {
            if (!buildingId) return

            setLoading(true)
            setError(null)

            try {
                const token = localStorage.getItem('token')
                const headers = { Authorization: `Bearer ${token}` }

                // Fetch location
                const locationRes = await axios.get(`${API_URL}/locations/${buildingId}`, { headers })
                setLocationData(locationRes.data)

                // Fetch floors for this location
                const floorsRes = await axios.get(`${API_URL}/locations/${buildingId}/floors`, { headers })
                const floorsData = floorsRes.data || []
                setFloors(floorsData)

                // Fetch rooms for each floor
                const roomsPromises = floorsData.map(floor =>
                    axios.get(`${API_URL}/floors/${floor.id}/rooms`, { headers })
                        .then(res => res.data.map(room => ({ ...room, floor_id: floor.id, floor_number: floor.floor_number })))
                        .catch(() => [])
                )

                const roomsArrays = await Promise.all(roomsPromises)
                const allRooms = roomsArrays.flat()
                setRooms(allRooms)

                // Fetch assets for the location
                await fetchAssets()

            } catch (err) {
                console.error('Error fetching location structure:', err)
                setError(err.response?.data?.message || 'Kunne ikke laste bygningsdata')
            } finally {
                setLoading(false)
            }
        }

        fetchLocationStructure()
    }, [buildingId, fetchAssets])

    // Transform data into the structure expected by BuildingView3D
    const building = useMemo(() => {
        if (!locationData || !floors.length) return null

        // Create floors with rooms
        const floorsWithRooms = floors.map(floor => {
            const floorRooms = rooms
                .filter(room => room.floor_id === floor.id)
                .map(room => {
                    // Get assets for this room
                    const roomAssets = assets.filter(asset => asset.room_id === room.id)

                    return {
                        id: room.id,
                        name: room.name,
                        type: room.room_type || 'office',
                        floor: floor.floor_number,
                        floor_number: floor.floor_number,
                        width: room.dimensions?.width || room.width || 6,
                        depth: room.dimensions?.depth || room.depth || 8,
                        height: room.dimensions?.height || room.height || 3,
                        position: room.position ? [
                            room.position.x || 0,
                            0,
                            room.position.z || 0
                        ] : null,
                        walls: room.walls || null,
                        assets: roomAssets
                    }
                })

            return {
                id: floor.id,
                name: floor.name,
                floor_number: floor.floor_number,
                rooms: floorRooms
            }
        }).sort((a, b) => a.floor_number - b.floor_number)

        // Flatten rooms for BuildingView3D
        const allRoomsFlat = floorsWithRooms.flatMap(floor => floor.rooms)

        return {
            id: locationData.id,
            name: locationData.name,
            address: locationData.address,
            type: locationData.type,
            floors: floorsWithRooms,
            rooms: allRoomsFlat
        }
    }, [locationData, floors, rooms, assets])

    const handleRoomSelect = (room, floor) => {
        console.log('Room selected:', room, 'on floor:', floor)
        setSelectedRoom(room)
    }

    const handleRefresh = async () => {
        setLoading(true)
        try {
            await fetchAssets()
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }
            const floorsRes = await axios.get(`${API_URL}/locations/${buildingId}/floors`, { headers })
            const floorsData = floorsRes.data || []

            const roomsPromises = floorsData.map(floor =>
                axios.get(`${API_URL}/floors/${floor.id}/rooms`, { headers })
                    .then(res => res.data.map(room => ({ ...room, floor_id: floor.id, floor_number: floor.floor_number })))
                    .catch(() => [])
            )

            const roomsArrays = await Promise.all(roomsPromises)
            setRooms(roomsArrays.flat())
        } catch (err) {
            console.error('Error refreshing:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading && !building) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Laster bygning...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            </div>
        )
    }

    if (!building) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen bygning funnet</h3>
                    <p className="text-gray-600">Kunne ikke laste bygningsdata</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col">
            <div className="p-6 border-b bg-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{building.name}</h1>
                        <p className="text-gray-600 mt-1">3D Bygningsvisning</p>
                        {building.address && (
                            <p className="text-sm text-gray-500 mt-1">{building.address}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500 text-right">
                            <div>{building.floors?.length || 0} etasjer</div>
                            <div>{building.rooms?.length || 0} rom</div>
                            <div>{assets.length} eiendeler</div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="Oppdater data"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <BuildingView3D
                    building={building}
                    onRoomSelect={handleRoomSelect}
                    selectedRoom={selectedRoom}
                    viewSettings={{
                        floorHeight: 3,
                        enableShadows: true,
                        enableEnvironment: true
                    }}
                />
            </div>
        </div>
    )
}

export default BuildingViewer
