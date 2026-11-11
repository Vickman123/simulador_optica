import { Vector3 } from '../math/vector3.js';
import { calculateFresnel, FresnelCoefficients } from './fresnel.js';

export interface RaySegment {
  start: Vector3;
  end: Vector3;
  direction: Vector3;
  intensity: number;
  wavelengthNm: number;
  opticalPathLength: number;
  mediumId: string;
}

export interface RayIntersectionResult {
  point: Vector3;
  normal: Vector3;
  distance: number;
}

export interface RayTraceBranch {
  incident: RaySegment;
  reflected: RaySegment | null;
  refracted: RaySegment | null;
  fresnel: FresnelCoefficients;
}

/**
 * Traces a ray hitting a planar boundary separating medium 1 (n1) from medium 2 (n2).
 */
export function tracePlanarInterface(
  rayStart: Vector3,
  rayDir: Vector3,
  interfacePoint: Vector3,
  interfaceNormal: Vector3,
  n1: number,
  n2: number,
  wavelengthNm: number,
  initialIntensity: number = 1.0,
  maxDistance: number = 1.5
): RayTraceBranch {
  const norm = interfaceNormal.normalize();
  const dir = rayDir.normalize();

  // Ensure normal opposes ray direction
  let effectiveNormal = norm;
  if (dir.dot(norm) > 0) {
    effectiveNormal = norm.scale(-1);
  }

  const cosThetaI = Math.min(1.0, Math.max(0.0, -dir.dot(effectiveNormal)));
  const thetaI = Math.acos(cosThetaI);
  const fresnel = calculateFresnel(thetaI, n1, n2);

  const incidentSegment: RaySegment = {
    start: rayStart,
    end: interfacePoint,
    direction: dir,
    intensity: initialIntensity,
    wavelengthNm,
    opticalPathLength: rayStart.sub(interfacePoint).length() * n1,
    mediumId: 'incident',
  };

  // Reflected ray
  const reflectDir = dir.reflect(effectiveNormal);
  const reflectedSegment: RaySegment = {
    start: interfacePoint,
    end: interfacePoint.add(reflectDir.scale(maxDistance)),
    direction: reflectDir,
    intensity: initialIntensity * fresnel.Runpolarized,
    wavelengthNm,
    opticalPathLength: maxDistance * n1,
    mediumId: 'reflected',
  };

  // Refracted ray (if not Total Internal Reflection)
  let refractedSegment: RaySegment | null = null;
  if (!fresnel.isTIR) {
    const refractDir = dir.refract(effectiveNormal, n1, n2);
    if (refractDir) {
      refractedSegment = {
        start: interfacePoint,
        end: interfacePoint.add(refractDir.scale(maxDistance)),
        direction: refractDir,
        intensity: initialIntensity * fresnel.Tunpolarized,
        wavelengthNm,
        opticalPathLength: maxDistance * n2,
        mediumId: 'refracted',
      };
    }
  }

  return {
    incident: incidentSegment,
    reflected: reflectedSegment,
    refracted: refractedSegment,
    fresnel,
  };
}
