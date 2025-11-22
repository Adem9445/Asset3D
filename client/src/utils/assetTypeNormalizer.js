/**
 * Normaliserer asset-typer fra API-et til nøklene brukt av 3D-komponentene
 */
export const normalizeAssetType = (type) => {
  if (!type) return null

  const normalized = type.toLowerCase().trim()

  const typeMap = {
    meeting_table: 'meetingTable',
    filing_cabinet: 'filingCabinet',
    trash_bin: 'trashBin',
    coffee_machine: 'coffeeMachine',
    water_cooler: 'waterCooler',
    washing_machine: 'washingMachine',
    dish_washer: 'dishwasher',
    dishwash: 'dishwasher',
    vent: 'ventilator'
  }

  if (typeMap[normalized]) {
    return typeMap[normalized]
  }

  // Konverter snake_case/kebab-case til camelCase
  return normalized.replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
}

/**
 * Forbereder en asset til 3D-visning med standard verdier
 */
export const prepareAssetFor3D = (asset) => {
  const mappedType = normalizeAssetType(asset?.type || asset?.asset_type)

  return {
    ...asset,
    type: mappedType,
    position: asset?.position?.length === 3 ? asset.position : [0, 0, 0],
    rotation: asset?.rotation?.length === 3 ? asset.rotation : [0, 0, 0],
    scale: asset?.scale?.length === 3 ? asset.scale : [1, 1, 1]
  }
}
