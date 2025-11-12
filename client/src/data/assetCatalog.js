/**
 * Asset Catalog with categories and items
 */

export const assetCatalog = {
  furniture: {
    name: 'Møbler',
    items: [
      {
        id: 'desk',
        name: 'Arbeidspult',
        type: 'desk',
        category: 'Møbler',
        description: 'Standard kontorpult med skuffer',
        dimensions: { width: 1.5, depth: 0.8, height: 0.75 },
        image: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=200&h=150&fit=crop',
        price: 4500,
        tags: ['kontor', 'arbeidsplass']
      },
      {
        id: 'chair',
        name: 'Kontorstol',
        type: 'chair',
        category: 'Møbler',
        description: 'Ergonomisk kontorstol med justerbar høyde',
        dimensions: { width: 0.6, depth: 0.6, height: 0.8 },
        image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=200&h=150&fit=crop',
        price: 2500,
        tags: ['kontor', 'sitteplass']
      },
      {
        id: 'sofa',
        name: 'Sofa',
        type: 'sofa',
        category: 'Møbler',
        description: '3-seters sofa for venterom',
        dimensions: { width: 2.0, depth: 0.8, height: 0.8 },
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=150&fit=crop',
        price: 8500,
        tags: ['venterom', 'lounge']
      },
      {
        id: 'bookshelf',
        name: 'Bokhylle',
        type: 'bookshelf',
        category: 'Møbler',
        description: 'Høy bokhylle med 5 hyller',
        dimensions: { width: 1.0, depth: 0.4, height: 2.0 },
        image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=200&h=150&fit=crop',
        price: 3200,
        tags: ['oppbevaring', 'kontor']
      },
      {
        id: 'meetingTable',
        name: 'Møtebord',
        type: 'meetingTable',
        category: 'Møbler',
        description: 'Stort møtebord for 8 personer',
        dimensions: { width: 2.0, depth: 1.2, height: 0.75 },
        image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&h=150&fit=crop',
        price: 12000,
        tags: ['møterom', 'konferanse']
      }
    ]
  },
  office: {
    name: 'Kontorutstyr',
    items: [
      {
        id: 'computer',
        name: 'Datamaskin',
        type: 'computer',
        category: 'IT',
        description: 'Stasjonær PC med skjerm',
        dimensions: { width: 0.4, depth: 0.3, height: 0.3 },
        image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200&h=150&fit=crop',
        price: 15000,
        tags: ['IT', 'elektronikk']
      },
      {
        id: 'printer',
        name: 'Skriver',
        type: 'printer',
        category: 'IT',
        description: 'Multifunksjonsskriver med skanner',
        dimensions: { width: 0.5, depth: 0.4, height: 0.3 },
        image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=200&h=150&fit=crop',
        price: 3500,
        tags: ['IT', 'kontorutstyr']
      },
      {
        id: 'phone',
        name: 'Kontortelefon',
        type: 'phone',
        category: 'IT',
        description: 'IP-telefon for konferanse',
        dimensions: { width: 0.2, depth: 0.2, height: 0.1 },
        image: 'https://images.unsplash.com/photo-1520923642038-b4259acecbd7?w=200&h=150&fit=crop',
        price: 1200,
        tags: ['kommunikasjon', 'IT']
      },
      {
        id: 'whiteboard',
        name: 'Whiteboard',
        type: 'whiteboard',
        category: 'Kontorutstyr',
        description: 'Magnetisk whiteboard',
        dimensions: { width: 1.5, depth: 0.1, height: 1.0 },
        image: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=200&h=150&fit=crop',
        price: 1800,
        tags: ['møterom', 'presentasjon']
      },
      {
        id: 'filingCabinet',
        name: 'Arkivskap',
        type: 'filingCabinet',
        category: 'Kontorutstyr',
        description: '4-skuffers arkivskap',
        dimensions: { width: 0.5, depth: 0.6, height: 1.2 },
        image: 'https://images.unsplash.com/photo-1567953996323-0e14d89e2687?w=200&h=150&fit=crop',
        price: 2800,
        tags: ['oppbevaring', 'arkiv']
      },
      {
        id: 'trashBin',
        name: 'Søppelbøtte',
        type: 'trashBin',
        category: 'Kontorutstyr',
        description: 'Avfallsbeholder med lokk',
        dimensions: { width: 0.3, depth: 0.3, height: 0.4 },
        image: 'https://images.unsplash.com/photo-1563809219697-31b5dc2e006e?w=200&h=150&fit=crop',
        price: 450,
        tags: ['renhold', 'kontor']
      }
    ]
  },
  kitchen: {
    name: 'Kjøkkenutstyr',
    items: [
      {
        id: 'coffeeMachine',
        name: 'Kaffemaskin',
        type: 'coffeeMachine',
        category: 'Kjøkken',
        description: 'Profesjonell kaffemaskin',
        dimensions: { width: 0.3, depth: 0.3, height: 0.4 },
        image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=200&h=150&fit=crop',
        price: 8500,
        tags: ['kjøkken', 'kantine']
      },
      {
        id: 'microwave',
        name: 'Mikrobølgeovn',
        type: 'microwave',
        category: 'Kjøkken',
        description: 'Mikrobølgeovn med grill',
        dimensions: { width: 0.5, depth: 0.4, height: 0.3 },
        image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=200&h=150&fit=crop',
        price: 1500,
        tags: ['kjøkken', 'kantine']
      },
      {
        id: 'refrigerator',
        name: 'Kjøleskap',
        type: 'refrigerator',
        category: 'Kjøkken',
        description: 'Stort kjøleskap med fryser',
        dimensions: { width: 0.7, depth: 0.7, height: 1.8 },
        image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=200&h=150&fit=crop',
        price: 12000,
        tags: ['kjøkken', 'kantine']
      },
      {
        id: 'waterCooler',
        name: 'Vannkjøler',
        type: 'waterCooler',
        category: 'Kjøkken',
        description: 'Vannkjøler med varmt og kaldt vann',
        dimensions: { width: 0.4, depth: 0.4, height: 1.2 },
        image: 'https://images.unsplash.com/photo-1606206873764-fd15e242df52?w=200&h=150&fit=crop',
        price: 3200,
        tags: ['kjøkken', 'vann']
      },
      {
        id: 'plant',
        name: 'Kontorplante',
        type: 'plant',
        category: 'Dekor',
        description: 'Grønn plante i potte',
        dimensions: { width: 0.3, depth: 0.3, height: 0.6 },
        image: 'https://images.unsplash.com/photo-1493957988430-a5f2e15f39a3?w=200&h=150&fit=crop',
        price: 450,
        tags: ['dekor', 'miljø']
      }
    ]
  },
  appliances: {
    name: 'Hvitevarer',
    items: [
      {
        id: 'dishwasher',
        name: 'Oppvaskmaskin',
        type: 'dishwasher',
        category: 'Kjøkken',
        description: 'Innebygd oppvaskmaskin',
        dimensions: { width: 0.6, depth: 0.6, height: 0.85 },
        image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=200&h=150&fit=crop',
        price: 6500,
        tags: ['kjøkken', 'hvitevarer']
      },
      {
        id: 'washingMachine',
        name: 'Vaskemaskin',
        type: 'washingMachine',
        category: 'Renhold',
        description: 'Frontlastet vaskemaskin',
        dimensions: { width: 0.6, depth: 0.6, height: 0.85 },
        image: 'https://images.unsplash.com/photo-1626806787426-2c80c358af52?w=200&h=150&fit=crop',
        price: 7500,
        tags: ['renhold', 'hvitevarer']
      },
      {
        id: 'dryer',
        name: 'Tørketrommel',
        type: 'dryer',
        category: 'Renhold',
        description: 'Tørketrommel med varmepumpe',
        dimensions: { width: 0.6, depth: 0.6, height: 0.85 },
        image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=200&h=150&fit=crop',
        price: 8500,
        tags: ['renhold', 'hvitevarer']
      }
    ]
  }
}

/**
 * Get all assets as flat array
 */
export const getAllAssets = () => {
  return Object.values(assetCatalog).flatMap(category => category.items)
}

/**
 * Get asset by type
 */
export const getAssetByType = (type) => {
  return getAllAssets().find(asset => asset.type === type)
}

/**
 * Get assets by category
 */
export const getAssetsByCategory = (categoryKey) => {
  return assetCatalog[categoryKey]?.items || []
}

/**
 * Search assets
 */
export const searchAssets = (query) => {
  const lowerQuery = query.toLowerCase()
  return getAllAssets().filter(asset => 
    asset.name.toLowerCase().includes(lowerQuery) ||
    asset.description.toLowerCase().includes(lowerQuery) ||
    asset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}
