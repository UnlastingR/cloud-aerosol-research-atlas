/**
 * Three.js SphereGeometry equirectangular UV mapping:
 *   u = (longitude + 180) / 360
 *   v = (latitude + 90) / 180
 * The textured Greenwich meridian (u=.5) faces +X, NOT +Z.
 * lon +90 (East) faces -Z, lon -90 faces +Z.
 */
export function latLonToCartesian(lat: number, lon: number, radius: number): [number, number, number] {
  const a = lat * Math.PI / 180;
  const b = lon * Math.PI / 180;
  return [
    radius * Math.cos(a) * Math.cos(b),
    radius * Math.sin(a),
    -radius * Math.cos(a) * Math.sin(b),
  ];
}

export function cartesianToLatLon(x: number, y: number, z: number): [number, number] {
  const lat = Math.atan2(y, Math.hypot(x, z)) * 180 / Math.PI;
  const lon = Math.atan2(-z, x) * 180 / Math.PI;
  return [lat, lon];
}

export function pointToUV(lat: number, lon: number): [number, number] {
  return [(lon + 180) / 360, (lat + 90) / 180];
}
