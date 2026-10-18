import test from 'node:test';
import assert from 'node:assert/strict';
import { SphereGeometry, Vector3 } from 'three';
import { latLonToCartesian, cartesianToLatLon, pointToUV } from '../src/geo.ts';

function almost(a, b, eps = 1e-8) {
  assert.ok(Math.abs(a-b) < eps, `expected ${a} ≈ ${b}`);
}

test('sphere texture: Greenwich is +X, 90E is -Z, 90W is +Z', () => {
  const a = latLonToCartesian(0, 0, 1);
  const b = latLonToCartesian(0, 90, 1);
  const c = latLonToCartesian(0, -90, 1);
  a.forEach((value, i) => almost(value, [1,0,0][i]));
  b.forEach((value, i) => almost(value, [0,0,-1][i]));
  c.forEach((value, i) => almost(value, [0,0,1][i]));
});

test('Beijing and Handan must be on the east Asian texture quadrant', () => {
  for(const [lat, lon] of [[39.905,116.395],[36.616,114.493]]) {
    const [x,y,z] = latLonToCartesian(lat,lon,2.28);
    const [roundLat, roundLon] = cartesianToLatLon(x,y,z);
    const [u,v] = pointToUV(lat,lon);
    almost(lat, roundLat);
    almost(lon, roundLon);
    assert.ok(u > .80 && u < .84, 'Expected East Asia in right-hand texture segment');
    assert.ok(v > .69 && v < .74, 'Expected northern mid-latitudes in texture');
    assert.ok(x < 0 && z < 0, 'East Asia visible in -X/-Z quadrant');
  }
});

test('Europe, US and China map to disjoint correct longitude bands', () => {
  const positions = [{lon:-122.309, band:[0,.2]}, {lon:0,band:[.49,.51]}, {lon:116.395,band:[.8,.84]}];
  for (const p of positions) {
    const [u] = pointToUV(40,p.lon);
    assert.ok(u >= p.band[0] && u <= p.band[1]);
  }
});

test('coordinates match Three.js SphereGeometry vertices and their actual UVs', () => {
  const sphere = new SphereGeometry(1, 256, 128);
  const positions = sphere.getAttribute('position');
  const uvs = sphere.getAttribute('uv');
  for (const [lat,lon] of [[39.905,116.395],[36.616,114.493],[51.498,-.174],[47.655,-122.309]]) {
    const [u,v] = pointToUV(lat,lon);
    let closest=0,score=Infinity;
    for(let i=0;i<uvs.count;i++) {
      const d=(uvs.getX(i)-u)**2+(uvs.getY(i)-v)**2;
      if(d<score){closest=i;score=d;}
    }
    const actual = new Vector3().fromBufferAttribute(positions,closest);
    const expected = new Vector3(...latLonToCartesian(lat,lon,1));
    assert.ok(actual.distanceTo(expected)<.035,`Earth UV mismatch at ${lat},${lon}`);
  }
  sphere.dispose();
});
