const KG_TO_LBS = 2.20462;
const KM_TO_MILES = 0.621371;

export function kgToLbs(kg: number): number {
  return Math.round(kg * KG_TO_LBS * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / KG_TO_LBS) * 10) / 10;
}

export function kmToMiles(km: number): number {
  return Math.round(km * KM_TO_MILES * 100) / 100;
}

export function milesToKm(miles: number): number {
  return Math.round((miles / KM_TO_MILES) * 100) / 100;
}

export function displayWeight(kg: number, unit: 'kg' | 'lbs'): string {
  if (unit === 'lbs') return `${kgToLbs(kg)} lbs`;
  return `${kg} kg`;
}

export function displayDistance(km: number, unit: 'km' | 'miles'): string {
  if (unit === 'miles') return `${kmToMiles(km)} mi`;
  return `${km} km`;
}

export function inputToKg(value: number, unit: 'kg' | 'lbs'): number {
  return unit === 'lbs' ? lbsToKg(value) : value;
}

export function kgToDisplay(kg: number, unit: 'kg' | 'lbs'): number {
  return unit === 'lbs' ? kgToLbs(kg) : kg;
}

export function inputToKm(value: number, unit: 'km' | 'miles'): number {
  return unit === 'miles' ? milesToKm(value) : value;
}

export function kmToDisplay(km: number, unit: 'km' | 'miles'): number {
  return unit === 'miles' ? kmToMiles(km) : km;
}
