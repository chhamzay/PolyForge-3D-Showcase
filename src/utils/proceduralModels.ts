import * as THREE from 'three';

export interface ProceduralAnimationObject {
  group: THREE.Group;
  update: (time: number, delta: number) => void;
  triangles: number;
  vertices: number;
}

// Helper to count triangles and vertices in a group
export function countMeshStats(object: THREE.Object3D): { triangles: number; vertices: number } {
  let triangles = 0;
  let vertices = 0;

  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geom = child.geometry;
      if (geom.index) {
        triangles += geom.index.count / 3;
      } else if (geom.attributes.position) {
        triangles += geom.attributes.position.count / 3;
      }
      if (geom.attributes.position) {
        vertices += geom.attributes.position.count;
      }
    }
  });

  return { triangles: Math.round(triangles), vertices: Math.round(vertices) };
}

// 1. Futuristic Cyber Drone
export function createCyberDrone(): ProceduralAnimationObject {
  const group = new THREE.Group();
  group.name = 'CyberDrone';

  // Materials
  const armorMat = new THREE.MeshStandardMaterial({
    color: 0x1c232e,
    metalness: 0.85,
    roughness: 0.25,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.95,
    roughness: 0.1,
  });

  const glowCyanMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00d2ff,
    emissiveIntensity: 2.2,
    roughness: 0.2,
  });

  const rotorMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.5,
    roughness: 0.4,
  });

  // Central Body
  const bodyGeom = new THREE.CylinderGeometry(0.8, 1.1, 0.5, 8);
  const bodyMesh = new THREE.Mesh(bodyGeom, armorMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // Dorsal Dome
  const domeGeom = new THREE.SphereGeometry(0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const domeMesh = new THREE.Mesh(domeGeom, chromeMat);
  domeMesh.position.y = 0.25;
  group.add(domeMesh);

  // Front glowing eye sensor
  const eyeGeom = new THREE.SphereGeometry(0.28, 16, 16);
  const eyeMesh = new THREE.Mesh(eyeGeom, glowCyanMat);
  eyeMesh.position.set(0, 0.05, 0.9);
  group.add(eyeMesh);

  // Sensor ring
  const ringGeom = new THREE.TorusGeometry(0.35, 0.05, 12, 24);
  const ringMesh = new THREE.Mesh(ringGeom, chromeMat);
  ringMesh.position.set(0, 0.05, 0.9);
  group.add(ringMesh);

  // 4 Rotor Arms & Blades
  const rotors: THREE.Group[] = [];
  const armAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];

  armAngles.forEach((angle) => {
    const armGroup = new THREE.Group();
    armGroup.rotation.y = angle;

    // Carbon Arm strut
    const armGeom = new THREE.BoxGeometry(0.12, 0.1, 1.8);
    const armMesh = new THREE.Mesh(armGeom, armorMat);
    armMesh.position.z = 1.0;
    armMesh.castShadow = true;
    armGroup.add(armMesh);

    // Motor Pod
    const podGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.35, 16);
    const podMesh = new THREE.Mesh(podGeom, chromeMat);
    podMesh.position.set(0, 0.15, 1.85);
    podMesh.castShadow = true;
    armGroup.add(podMesh);

    // Glowing pod ring
    const podRingGeom = new THREE.TorusGeometry(0.3, 0.03, 8, 24);
    const podRingMesh = new THREE.Mesh(podRingGeom, glowCyanMat);
    podRingMesh.rotation.x = Math.PI * 0.5;
    podRingMesh.position.set(0, 0.2, 1.85);
    armGroup.add(podRingMesh);

    // Spinning Blades Group
    const bladeGroup = new THREE.Group();
    bladeGroup.position.set(0, 0.35, 1.85);

    const bladeGeom = new THREE.BoxGeometry(0.15, 0.02, 1.4);
    const blade1 = new THREE.Mesh(bladeGeom, rotorMat);
    const blade2 = new THREE.Mesh(bladeGeom, rotorMat);
    blade2.rotation.y = Math.PI * 0.5;
    bladeGroup.add(blade1, blade2);

    armGroup.add(bladeGroup);
    rotors.push(bladeGroup);

    group.add(armGroup);
  });

  // Landing Skids
  [-0.6, 0.6].forEach((x) => {
    const skidGeom = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8);
    const skidMesh = new THREE.Mesh(skidGeom, chromeMat);
    skidMesh.rotation.x = Math.PI * 0.5;
    skidMesh.position.set(x, -0.6, 0);

    // Struts
    const strut1 = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6);
    const s1 = new THREE.Mesh(strut1, chromeMat);
    s1.position.set(x, -0.35, 0.5);
    s1.rotation.z = x > 0 ? -0.2 : 0.2;

    const s2 = new THREE.Mesh(strut1, chromeMat);
    s2.position.set(x, -0.35, -0.5);
    s2.rotation.z = x > 0 ? -0.2 : 0.2;

    group.add(skidMesh, s1, s2);
  });

  const stats = countMeshStats(group);

  return {
    group,
    triangles: stats.triangles,
    vertices: stats.vertices,
    update: (time) => {
      // Hover bobbing
      group.position.y = Math.sin(time * 2) * 0.08;
      // Slight bank tilt
      group.rotation.z = Math.sin(time * 1.5) * 0.03;
      group.rotation.x = Math.cos(time * 1.5) * 0.02;

      // Fast spinning rotors
      rotors.forEach((blade, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        blade.rotation.y += 0.35 * direction;
      });
    },
  };
}

// 2. Titan Mech Core (Robotic Torso & Reactor)
export function createMechCore(): ProceduralAnimationObject {
  const group = new THREE.Group();
  group.name = 'MechCore';

  const armorSteel = new THREE.MeshStandardMaterial({
    color: 0x242830,
    metalness: 0.8,
    roughness: 0.35,
  });

  const orangeDecal = new THREE.MeshStandardMaterial({
    color: 0xd95a14,
    metalness: 0.4,
    roughness: 0.4,
  });

  const chromePiston = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    metalness: 0.95,
    roughness: 0.15,
  });

  const reactorGlow = new THREE.MeshStandardMaterial({
    color: 0xff6600,
    emissive: 0xff5500,
    emissiveIntensity: 3.0,
    roughness: 0.1,
  });

  // Torso Main Frame
  const chestGeom = new THREE.BoxGeometry(1.8, 1.4, 1.2);
  const chestMesh = new THREE.Mesh(chestGeom, armorSteel);
  chestMesh.position.y = 0.5;
  chestMesh.castShadow = true;
  group.add(chestMesh);

  // Beveled Shoulder Mounts
  [-1.2, 1.2].forEach((x) => {
    const shoulderGeom = new THREE.CylinderGeometry(0.5, 0.4, 0.8, 12);
    const shoulder = new THREE.Mesh(shoulderGeom, armorSteel);
    shoulder.rotation.z = Math.PI * 0.5;
    shoulder.position.set(x, 0.9, 0);
    group.add(shoulder);

    // Accent Plates
    const plateGeom = new THREE.BoxGeometry(0.3, 0.6, 0.9);
    const plate = new THREE.Mesh(plateGeom, orangeDecal);
    plate.position.set(x * 1.15, 1.1, 0);
    group.add(plate);
  });

  // Chest Armor Plates (V-Angled)
  const plateL = new THREE.BoxGeometry(0.7, 0.8, 0.15);
  const pL = new THREE.Mesh(plateL, orangeDecal);
  pL.position.set(-0.45, 0.6, 0.65);
  pL.rotation.y = 0.2;
  pL.rotation.z = -0.1;

  const pR = new THREE.Mesh(plateL, orangeDecal);
  pR.position.set(0.45, 0.6, 0.65);
  pR.rotation.y = -0.2;
  pR.rotation.z = 0.1;
  group.add(pL, pR);

  // Glowing Plasma Arc Reactor in Center
  const reactorGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 24);
  const reactorMesh = new THREE.Mesh(reactorGeom, reactorGlow);
  reactorMesh.rotation.x = Math.PI * 0.5;
  reactorMesh.position.set(0, 0.45, 0.62);
  group.add(reactorMesh);

  // Reactor Protective Mesh / Grate
  const grateGeom = new THREE.TorusGeometry(0.38, 0.05, 12, 24);
  const grateMesh = new THREE.Mesh(grateGeom, chromePiston);
  grateMesh.position.set(0, 0.45, 0.68);
  group.add(grateMesh);

  // Hydraulic Waist Pistons
  const waistGeom = new THREE.CylinderGeometry(0.4, 0.5, 0.7, 16);
  const waistMesh = new THREE.Mesh(waistGeom, armorSteel);
  waistMesh.position.y = -0.5;
  group.add(waistMesh);

  const pistons: THREE.Mesh[] = [];
  [-0.5, 0.5].forEach((x) => {
    const pistonGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.9, 12);
    const piston = new THREE.Mesh(pistonGeom, chromePiston);
    piston.position.set(x, -0.4, 0.3);
    group.add(piston);
    pistons.push(piston);
  });

  // Exhaust Stacks on back
  [-0.6, 0.6].forEach((x) => {
    const pipeGeom = new THREE.CylinderGeometry(0.18, 0.15, 1.2, 12);
    const pipe = new THREE.Mesh(pipeGeom, armorSteel);
    pipe.position.set(x, 1.2, -0.6);
    pipe.rotation.x = -0.3;
    group.add(pipe);
  });

  const stats = countMeshStats(group);

  return {
    group,
    triangles: stats.triangles,
    vertices: stats.vertices,
    update: (time) => {
      // Breathing mechanical pulse
      const pulse = Math.sin(time * 3);
      reactorGlow.emissiveIntensity = 2.5 + pulse * 1.2;
      group.position.y = Math.sin(time * 1.5) * 0.04;
      group.rotation.y = Math.sin(time * 0.8) * 0.08;
    },
  };
}

// 3. Sci-Fi Valkyrie Combat Helmet
export function createSciFiHelmet(): ProceduralAnimationObject {
  const group = new THREE.Group();
  group.name = 'SciFiHelmet';

  const carbonShell = new THREE.MeshStandardMaterial({
    color: 0x181b20,
    metalness: 0.7,
    roughness: 0.3,
  });

  const visorGold = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.98,
    roughness: 0.08,
  });

  const neonAccent = new THREE.MeshStandardMaterial({
    color: 0x00ffaa,
    emissive: 0x00ff88,
    emissiveIntensity: 2.0,
  });

  const detailMat = new THREE.MeshStandardMaterial({
    color: 0x444b54,
    metalness: 0.85,
    roughness: 0.25,
  });

  // Helmet Dome
  const domeGeom = new THREE.SphereGeometry(1.2, 32, 24);
  const dome = new THREE.Mesh(domeGeom, carbonShell);
  dome.scale.set(0.9, 1.1, 1.05);
  dome.castShadow = true;
  group.add(dome);

  // Visor (Curved panoramic face plate)
  const visorGeom = new THREE.SphereGeometry(1.22, 32, 16, -Math.PI * 0.35, Math.PI * 0.7, Math.PI * 0.28, Math.PI * 0.45);
  const visor = new THREE.Mesh(visorGeom, visorGold);
  visor.scale.set(0.92, 1.08, 1.08);
  visor.position.set(0, 0.05, 0.1);
  group.add(visor);

  // Visor Top Brow Guard
  const browGeom = new THREE.TorusGeometry(1.15, 0.1, 12, 24, Math.PI * 0.6);
  const brow = new THREE.Mesh(browGeom, detailMat);
  brow.position.set(0, 0.5, 0.4);
  brow.rotation.x = -Math.PI * 0.2;
  brow.rotation.z = Math.PI * 0.7;
  group.add(brow);

  // Side Filter Pods / Respirators
  [-1.0, 1.0].forEach((x) => {
    const podGeom = new THREE.CylinderGeometry(0.35, 0.4, 0.5, 16);
    const pod = new THREE.Mesh(podGeom, detailMat);
    pod.rotation.z = Math.PI * 0.5;
    pod.position.set(x, -0.3, 0.4);
    group.add(pod);

    // Glowing Vent Strip
    const ventGeom = new THREE.TorusGeometry(0.36, 0.04, 8, 20);
    const vent = new THREE.Mesh(ventGeom, neonAccent);
    vent.rotation.y = Math.PI * 0.5;
    vent.position.set(x * 1.15, -0.3, 0.4);
    group.add(vent);
  });

  // Crest / Fin on top
  const crestGeom = new THREE.BoxGeometry(0.1, 0.35, 1.6);
  const crest = new THREE.Mesh(crestGeom, detailMat);
  crest.position.set(0, 1.25, -0.1);
  crest.rotation.x = 0.15;
  group.add(crest);

  // Glowing crest strip
  const stripGeom = new THREE.BoxGeometry(0.04, 0.08, 1.4);
  const strip = new THREE.Mesh(stripGeom, neonAccent);
  strip.position.set(0, 1.4, -0.1);
  strip.rotation.x = 0.15;
  group.add(strip);

  // Neck Collar Ring
  const collarGeom = new THREE.CylinderGeometry(0.85, 1.1, 0.4, 24, 1, true);
  const collar = new THREE.Mesh(collarGeom, carbonShell);
  collar.position.y = -1.1;
  group.add(collar);

  const stats = countMeshStats(group);

  return {
    group,
    triangles: stats.triangles,
    vertices: stats.vertices,
    update: (time) => {
      // Slow subtle scan rotation
      group.rotation.y = Math.sin(time * 0.6) * 0.2;
      group.position.y = Math.sin(time * 1.2) * 0.04;
    },
  };
}

// 4. Quantum Monolith Crystal (Refractive Core + Gyro Rings)
export function createQuantumCrystal(): ProceduralAnimationObject {
  const group = new THREE.Group();
  group.name = 'QuantumCrystal';

  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0x8a2be2,
    emissive: 0x4a0082,
    emissiveIntensity: 1.2,
    roughness: 0.1,
    metalness: 0.2,
    transmission: 0.7,
    ior: 1.6,
  });

  const goldRingMat = new THREE.MeshStandardMaterial({
    color: 0xf5b041,
    metalness: 0.95,
    roughness: 0.15,
  });

  const nodeGlowMat = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    emissive: 0x00ffff,
    emissiveIntensity: 3.0,
  });

  // Central Crystal Form (Faceted Octahedron + Inset)
  const crystalGeom = new THREE.OctahedronGeometry(1.2, 0);
  crystalGeom.scale(0.8, 1.6, 0.8);
  const crystal = new THREE.Mesh(crystalGeom, crystalMat);
  crystal.castShadow = true;
  group.add(crystal);

  // Inner Pulsing Glow Sphere
  const innerGeom = new THREE.IcosahedronGeometry(0.5, 2);
  const innerMesh = new THREE.Mesh(innerGeom, nodeGlowMat);
  group.add(innerMesh);

  // 3 Orbiting Gyroscope Rings
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.05, 16, 64), goldRingMat);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.05, 16, 64), goldRingMat);
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.05, 16, 64), goldRingMat);

  // Add satellite nodes to rings
  [ring1, ring2, ring3].forEach((r, idx) => {
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), nodeGlowMat);
    node.position.x = 1.8 + idx * 0.4;
    r.add(node);
  });

  group.add(ring1, ring2, ring3);

  // Floating Orbital Fragments
  const fragments: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const dist = 1.6 + (i % 3) * 0.3;
    const fGeom = new THREE.TetrahedronGeometry(0.15);
    const fragment = new THREE.Mesh(fGeom, crystalMat);
    fragment.position.set(Math.cos(angle) * dist, (i % 2 === 0 ? 0.6 : -0.6), Math.sin(angle) * dist);
    group.add(fragment);
    fragments.push(fragment);
  }

  const stats = countMeshStats(group);

  return {
    group,
    triangles: stats.triangles,
    vertices: stats.vertices,
    update: (time) => {
      // Crystal spin & float
      crystal.rotation.y = time * 0.8;
      crystal.position.y = Math.sin(time * 2) * 0.12;
      innerMesh.scale.setScalar(1 + Math.sin(time * 4) * 0.15);

      // Gyro Rings Multi-axis Rotations
      ring1.rotation.x = time * 0.7;
      ring1.rotation.y = time * 0.5;

      ring2.rotation.y = -time * 0.6;
      ring2.rotation.z = time * 0.4;

      ring3.rotation.z = time * 0.5;
      ring3.rotation.x = -time * 0.3;

      // Floating fragments
      fragments.forEach((frag, idx) => {
        frag.rotation.x += 0.02;
        frag.rotation.y += 0.03;
        frag.position.y += Math.sin(time * 3 + idx) * 0.003;
      });
    },
  };
}

// 5. Spectre-09 Full Humanoid Cybernetic Character
export function createCyberCharacter(): ProceduralAnimationObject {
  const group = new THREE.Group();
  group.name = 'CyberCharacter';

  const armorDark = new THREE.MeshStandardMaterial({
    color: 0x161b22,
    metalness: 0.85,
    roughness: 0.28,
  });

  const armorGold = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.95,
    roughness: 0.15,
  });

  const chromeJoint = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.95,
    roughness: 0.1,
  });

  const glowCyan = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00f0ff,
    emissiveIntensity: 2.8,
    roughness: 0.2,
  });

  // Center offset so character stands on floor
  const root = new THREE.Group();
  root.position.y = -0.1;
  group.add(root);

  // --- HEAD & HELMET ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.75, 0);

  const skullGeom = new THREE.SphereGeometry(0.24, 16, 16);
  skullGeom.scale(0.9, 1.1, 1.0);
  const skull = new THREE.Mesh(skullGeom, armorDark);
  skull.castShadow = true;
  headGroup.add(skull);

  // Visor (Glowing horizontal optical strip)
  const visorGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16, 1, false, -Math.PI * 0.4, Math.PI * 0.8);
  const visor = new THREE.Mesh(visorGeom, glowCyan);
  visor.position.set(0, 0.04, 0.05);
  headGroup.add(visor);

  // Tactical Ear Antennas
  [-0.24, 0.24].forEach((x) => {
    const earNode = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 8), chromeJoint);
    earNode.rotation.z = Math.PI * 0.5;
    earNode.position.set(x, 0.02, 0);
    headGroup.add(earNode);
  });

  // Neck
  const neckGeom = new THREE.CylinderGeometry(0.1, 0.12, 0.18, 12);
  const neck = new THREE.Mesh(neckGeom, chromeJoint);
  neck.position.set(0, 1.55, 0);
  root.add(neck);
  root.add(headGroup);

  // --- TORSO & CHEST ARMOR ---
  const chestGeom = new THREE.BoxGeometry(0.65, 0.55, 0.35);
  const chest = new THREE.Mesh(chestGeom, armorDark);
  chest.position.set(0, 1.25, 0);
  chest.castShadow = true;
  root.add(chest);

  // Chest V-Armor Gold Plates
  const vPlateL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.06), armorGold);
  vPlateL.position.set(-0.16, 1.3, 0.19);
  vPlateL.rotation.z = -0.15;

  const vPlateR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.06), armorGold);
  vPlateR.position.set(0.16, 1.3, 0.19);
  vPlateR.rotation.z = 0.15;
  root.add(vPlateL, vPlateR);

  // Glowing Arc Reactor Core in Chest
  const reactor = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16), glowCyan);
  reactor.rotation.x = Math.PI * 0.5;
  reactor.position.set(0, 1.25, 0.2);
  root.add(reactor);

  // Abdomen (Segmented cyber spine)
  const abGeom = new THREE.CylinderGeometry(0.22, 0.26, 0.32, 12);
  const abdomen = new THREE.Mesh(abGeom, chromeJoint);
  abdomen.position.set(0, 0.85, 0);
  root.add(abdomen);

  // Pelvis / Belt
  const beltGeom = new THREE.BoxGeometry(0.55, 0.18, 0.32);
  const belt = new THREE.Mesh(beltGeom, armorDark);
  belt.position.set(0, 0.65, 0);
  root.add(belt);

  // --- SHOULDERS & ARMS ---
  const armLGroup = new THREE.Group();
  const armRGroup = new THREE.Group();
  armLGroup.position.set(-0.45, 1.4, 0);
  armRGroup.position.set(0.45, 1.4, 0);

  [-1, 1].forEach((dir) => {
    const parentGroup = dir === -1 ? armLGroup : armRGroup;

    // Shoulder Pauldron
    const pauldronGeom = new THREE.SphereGeometry(0.18, 12, 12);
    pauldronGeom.scale(1.1, 0.9, 1.1);
    const pauldron = new THREE.Mesh(pauldronGeom, armorGold);
    pauldron.position.y = -0.05;
    parentGroup.add(pauldron);

    // Bicep
    const bicep = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.35, 10), armorDark);
    bicep.position.y = -0.3;
    parentGroup.add(bicep);

    // Elbow Joint
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), chromeJoint);
    elbow.position.y = -0.5;
    parentGroup.add(elbow);

    // Forearm / Gauntlet
    const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.35, 0.14), armorDark);
    forearm.position.y = -0.7;
    parentGroup.add(forearm);

    // Glowing Gauntlet Strip
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.16), glowCyan);
    strip.position.set(dir * 0.06, -0.7, 0);
    parentGroup.add(strip);

    // Hand Fist
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.12), chromeJoint);
    hand.position.y = -0.92;
    parentGroup.add(hand);
  });

  root.add(armLGroup, armRGroup);

  // --- LEGS & COMBAT BOOTS ---
  [-0.18, 0.18].forEach((x) => {
    // Hip Joint
    const hip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), chromeJoint);
    hip.position.set(x, 0.52, 0);
    root.add(hip);

    // Thigh
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.55, 12), armorDark);
    thigh.position.set(x, 0.2, 0);
    root.add(thigh);

    // Knee Armor Guard
    const knee = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.1), armorGold);
    knee.position.set(x, -0.1, 0.08);
    root.add(knee);

    // Calf / Shin
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.6, 12), armorDark);
    shin.position.set(x, -0.45, 0);
    root.add(shin);

    // Combat Boot
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.35), armorDark);
    boot.position.set(x, -0.82, 0.06);
    root.add(boot);

    // Glowing Boot Sole
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.34), glowCyan);
    sole.position.set(x, -0.92, 0.06);
    root.add(sole);
  });

  // --- BACKPACK JETPACK / ENERGY PACK ---
  const packGeom = new THREE.BoxGeometry(0.42, 0.45, 0.2);
  const jetpack = new THREE.Mesh(packGeom, armorDark);
  jetpack.position.set(0, 1.25, -0.22);
  root.add(jetpack);

  // Twin Thruster Nozzles
  [-0.14, 0.14].forEach((x) => {
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.25, 12), chromeJoint);
    nozzle.position.set(x, 0.95, -0.25);
    nozzle.rotation.x = -0.2;

    const exhaustGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.06, 8), glowCyan);
    exhaustGlow.position.set(x, 0.82, -0.28);
    root.add(nozzle, exhaustGlow);
  });

  const stats = countMeshStats(group);

  return {
    group,
    triangles: stats.triangles,
    vertices: stats.vertices,
    update: (time) => {
      // Subtle idle breathing
      chest.scale.set(1 + Math.sin(time * 2) * 0.02, 1, 1 + Math.sin(time * 2) * 0.03);
      headGroup.rotation.y = Math.sin(time * 0.8) * 0.15;
      headGroup.rotation.x = Math.cos(time * 1.2) * 0.05;

      // Arm subtle stance sway
      armLGroup.rotation.x = Math.sin(time * 1.5) * 0.05;
      armRGroup.rotation.x = -Math.sin(time * 1.5) * 0.05;

      // Pulsing reactor
      glowCyan.emissiveIntensity = 2.4 + Math.sin(time * 3) * 0.8;
    },
  };
}
