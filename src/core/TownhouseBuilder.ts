import * as THREE from 'three';

export interface TownhouseMaterials {
  sofaMaterial: THREE.MeshStandardMaterial;
  floorMaterial: THREE.MeshStandardMaterial;
  wallMaterial: THREE.MeshStandardMaterial;
  exteriorWallMaterial: THREE.MeshStandardMaterial;
  woodAccentMaterial: THREE.MeshStandardMaterial;
  warmWoodMaterial: THREE.MeshStandardMaterial;
  slateWallMaterial: THREE.MeshStandardMaterial;
  glassMaterial: THREE.MeshStandardMaterial;
  darkMetalMaterial: THREE.MeshStandardMaterial;
  marbleMaterial: THREE.MeshStandardMaterial;
  stoneBaseMaterial: THREE.MeshStandardMaterial;
  terracottaPotMaterial: THREE.MeshStandardMaterial;
  foliageMaterial: THREE.MeshStandardMaterial;
  flowerMaterial: THREE.MeshStandardMaterial;
  sconceGlowMaterial: THREE.MeshStandardMaterial;
}

export class TownhouseBuilder {
  public rootGroup: THREE.Group = new THREE.Group();
  public materials: TownhouseMaterials;

  // Interactive and animatable components
  public frontDoorGroup: THREE.Group = new THREE.Group();
  public leftDoorGroup: THREE.Group = new THREE.Group();
  public rightDoorGroup: THREE.Group = new THREE.Group();
  public customRoomGroup: THREE.Group = new THREE.Group();
  public roofGroup: THREE.Group = new THREE.Group();
  public livingGroup: THREE.Group = new THREE.Group();

  // Customizer target meshes
  public sofaMeshes: THREE.Mesh[] = [];
  public floorMeshes: THREE.Mesh[] = [];
  public interiorWallMeshes: THREE.Mesh[] = [];

  constructor() {
    this.rootGroup.name = 'MyHousing_Townhouse_Root';
    this.materials = this.createDefaultMaterials();
    this.buildHouse();
  }

  private createDefaultMaterials(): TownhouseMaterials {
    return {
      // 1. Sofa
      sofaMaterial: new THREE.MeshStandardMaterial({
        color: 0x2d3138,
        roughness: 0.85,
        metalness: 0.05
      }),

      // 2. Floor: Light Oak Wood (matching interior floor)
      floorMaterial: new THREE.MeshStandardMaterial({
        color: 0xc89d6d,
        roughness: 0.38,
        metalness: 0.05
      }),

      // 3. Interior Wall: Clean warm Scandinavian cream/white
      wallMaterial: new THREE.MeshStandardMaterial({
        color: 0xf5f2eb,
        roughness: 0.9,
        metalness: 0.0
      }),

      // 4. Exterior Wall: Crisp architectural white matching my-housing.mp4
      exteriorWallMaterial: new THREE.MeshStandardMaterial({
        color: 0xfdfdfd,
        roughness: 0.72,
        metalness: 0.02
      }),

      // 5. Wood Accents
      woodAccentMaterial: new THREE.MeshStandardMaterial({
        color: 0x7c4923,
        roughness: 0.5,
        metalness: 0.05
      }),

      // 6. Warm Natural Timber
      warmWoodMaterial: new THREE.MeshStandardMaterial({
        color: 0x935c32,
        roughness: 0.45,
        metalness: 0.05
      }),

      // 7. Dark Polished Marble for Facade & Steps (my-housing.mp4)
      slateWallMaterial: new THREE.MeshStandardMaterial({
        color: 0x181b20,
        roughness: 0.22,
        metalness: 0.18
      }),

      // 8. Architectural Glass: Transparent glass showing interior curtains and lights
      glassMaterial: new THREE.MeshStandardMaterial({
        color: 0xe6f3fb,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        metalness: 0.1
      }),

      // 9. Matte Black Metal for Gate, Pergola & Window Frames (my-housing.mp4)
      darkMetalMaterial: new THREE.MeshStandardMaterial({
        color: 0x1a1d21,
        roughness: 0.32,
        metalness: 0.85
      }),

      // 10. Polished Dark Grey / Black Marble
      marbleMaterial: new THREE.MeshStandardMaterial({
        color: 0x15181c,
        roughness: 0.18,
        metalness: 0.22
      }),

      // 11. Stacked Stone Base for Fence
      stoneBaseMaterial: new THREE.MeshStandardMaterial({
        color: 0x5a6068,
        roughness: 0.88,
        metalness: 0.05
      }),

      // 12. Terracotta Pots
      terracottaPotMaterial: new THREE.MeshStandardMaterial({
        color: 0xb57a55,
        roughness: 0.75,
        metalness: 0.02
      }),

      // 13. Lush Natural Foliage & Palms
      foliageMaterial: new THREE.MeshStandardMaterial({
        color: 0x2b571e,
        roughness: 0.75,
        metalness: 0.02
      }),

      // 14. Bougainvillea pink flowers (Hoa giấy hồng my-housing.mp4)
      flowerMaterial: new THREE.MeshStandardMaterial({
        color: 0xe04d7c,
        roughness: 0.65,
        metalness: 0.05
      }),

      // 15. Up-down wall sconce warm 3000K light source
      sconceGlowMaterial: new THREE.MeshStandardMaterial({
        color: 0xffe6a8,
        emissive: 0xffb347,
        emissiveIntensity: 1.5,
        roughness: 0.15
      })
    };
  }

  private buildHouse(): void {
    this.buildGroundAndLandscape();
    this.buildFrontCompoundGateAndFence();
    this.buildCourtyardAndZenGarden();
    this.buildGroundFloorMarbleFacade();
    this.buildFrontEntranceAndDoors();
    this.buildSecondFloorCurvedFacade();
    this.buildThirdFloorTerrace();
    this.buildInteriorShell();
  }

  /**
   * 1. SURROUNDING ENVIRONMENT: Green lawn, asphalt street, park trees (my-housing.mp4)
   */
  private buildGroundAndLandscape(): void {
    // Green lawn extending widely
    const grassGeo = new THREE.PlaneGeometry(70, 70);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x487935,
      roughness: 0.88
    });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, -0.01, 0);
    grass.receiveShadow = true;
    this.rootGroup.add(grass);

    // Front asphalt street (z = 7.5 to 20)
    const streetGeo = new THREE.PlaneGeometry(36, 14);
    const streetMat = new THREE.MeshStandardMaterial({
      color: 0x3d4249,
      roughness: 0.8
    });
    const street = new THREE.Mesh(streetGeo, streetMat);
    street.rotation.x = -Math.PI / 2;
    street.position.set(0, 0.005, 14.5);
    street.receiveShadow = true;
    this.rootGroup.add(street);

    // Sidewalk curb
    const curb = new THREE.Mesh(
      new THREE.BoxGeometry(28, 0.14, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x8f96a1, roughness: 0.65 })
    );
    curb.position.set(0, 0.07, 7.7);
    this.rootGroup.add(curb);

    // White perimeter compound boundary walls on left and right (my-housing.mp4)
    const wallMat = this.materials.exteriorWallMaterial;
    const wallCopingMat = new THREE.MeshStandardMaterial({ color: 0x2b3038, roughness: 0.5 });

    // Left perimeter wall (x = -2.75, length 19m)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.35, 19.0), wallMat);
    leftWall.position.set(-2.75, 1.175, -2.0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    this.rootGroup.add(leftWall);

    const leftCoping = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 19.1), wallCopingMat);
    leftCoping.position.set(-2.75, 2.39, -2.0);
    this.rootGroup.add(leftCoping);

    // Right perimeter wall (x = +2.75, length 19m)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.35, 19.0), wallMat);
    rightWall.position.set(2.75, 1.175, -2.0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    this.rootGroup.add(rightWall);

    const rightCoping = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 19.1), wallCopingMat);
    rightCoping.position.set(2.75, 2.39, -2.0);
    this.rootGroup.add(rightCoping);

    // Natural landscape park trees flanking the townhouse (my-housing.mp4 00:00)
    const treePositions: [number, number, number, boolean][] = [
      [-6.5, 0, 7.5, false],
      [-7.8, 0, 1.5, true],
      [-8.2, 0, -5.5, false],
      [-6.0, 0, -12.0, false],
      [6.8, 0, 8.0, false],
      [7.8, 0, 1.8, false],
      [8.0, 0, -5.0, true],
      [6.2, 0, -12.0, false]
    ];

    treePositions.forEach((pos, idx) => {
      this.createLandscapeTree(pos[0], pos[1], pos[2], 0.9 + (idx % 3) * 0.2, pos[3]);
    });
  }

  private createLandscapeTree(x: number, y: number, z: number, scale: number = 1.0, isFlowering: boolean = false): void {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);
    treeGroup.scale.setScalar(scale);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.26, 3.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x483626, roughness: 0.9 })
    );
    trunk.position.set(0, 1.7, 0);
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const leafColor = isFlowering ? 0xb33871 : 0x2b571e;
    const crownMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.8 });

    const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), crownMat);
    crown1.position.set(0, 3.7, 0);
    crown1.castShadow = true;
    treeGroup.add(crown1);

    const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), crownMat);
    crown2.position.set(0.35, 4.5, 0.3);
    crown2.castShadow = true;
    treeGroup.add(crown2);

    const crown3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 1), crownMat);
    crown3.position.set(-0.35, 4.3, -0.3);
    crown3.castShadow = true;
    treeGroup.add(crown3);

    this.rootGroup.add(treeGroup);
  }

  /**
   * 2. FRONT COMPOUND WALL, GATE PORTAL & FENCE (my-housing.mp4 00:00)
   * Center white portal with horizontal slatted gate + Left/Right stone-base fence wings with vertical pickets.
   */
  private buildFrontCompoundGateAndFence(): void {
    const fenceGroup = new THREE.Group();
    fenceGroup.position.set(0, 0, 7.5);

    const whiteMat = this.materials.exteriorWallMaterial;
    const darkCapMat = new THREE.MeshStandardMaterial({ color: 0x22262c, roughness: 0.4 });
    const metalMat = this.materials.darkMetalMaterial;
    const stoneMat = this.materials.stoneBaseMaterial;

    // A. CENTER GATE PORTAL (x = -1.35 to +1.35, height 2.65m)
    // Left Portal Pillar
    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.38, 2.65, 0.45), whiteMat);
    leftPillar.position.set(-1.35, 1.325, 0);
    leftPillar.castShadow = true;
    fenceGroup.add(leftPillar);

    const leftCap = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.52), darkCapMat);
    leftCap.position.set(-1.35, 2.69, 0);
    fenceGroup.add(leftCap);

    // Right Portal Pillar
    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.38, 2.65, 0.45), whiteMat);
    rightPillar.position.set(1.35, 1.325, 0);
    rightPillar.castShadow = true;
    fenceGroup.add(rightPillar);

    const rightCap = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.52), darkCapMat);
    rightCap.position.set(1.35, 2.69, 0);
    fenceGroup.add(rightCap);

    // Top Portal Lintel Beam
    const portalBeam = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.32, 0.45), whiteMat);
    portalBeam.position.set(0, 2.51, 0);
    portalBeam.castShadow = true;
    fenceGroup.add(portalBeam);

    const beamCap = new THREE.Mesh(new THREE.BoxGeometry(3.16, 0.06, 0.52), darkCapMat);
    beamCap.position.set(0, 2.7, 0);
    fenceGroup.add(beamCap);

    // Gate Doors: Horizontal dark metal slats (my-housing.mp4 00:00)
    const gateFrame = new THREE.Mesh(new THREE.BoxGeometry(2.32, 2.25, 0.05), metalMat);
    gateFrame.position.set(0, 1.15, 0);
    gateFrame.castShadow = true;
    fenceGroup.add(gateFrame);

    for (let i = 0; i < 13; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.08, 0.03), metalMat);
      slat.position.set(0, 0.22 + i * 0.16, 0.035);
      fenceGroup.add(slat);
    }

    // Vertical black sconce lamps on inner face of portal pillars (my-housing.mp4 00:00)
    [-1.22, 1.22].forEach((sx) => {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.08), metalMat);
      lamp.position.set(sx, 1.6, 0.25);
      fenceGroup.add(lamp);

      const lampGlow = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.02), this.materials.sconceGlowMaterial);
      lampGlow.position.set(sx, 1.6, 0.3);
      fenceGroup.add(lampGlow);
    });

    // B. LEFT FENCE SECTION (x = -2.75 to -1.35)
    // Stacked stone base
    const leftStoneBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.46, 0.22), stoneMat);
    leftStoneBase.position.set(-2.05, 0.23, 0);
    leftStoneBase.castShadow = true;
    fenceGroup.add(leftStoneBase);

    // Vertical dark iron pickets (6 bars)
    for (let i = 0; i < 6; i++) {
      const barX = -2.5 + i * 0.18;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.045, 1.6, 0.045), metalMat);
      bar.position.set(barX, 1.3, 0);
      bar.castShadow = true;
      fenceGroup.add(bar);
    }

    // White top header beam capping left pickets
    const leftTopBeam = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.22), whiteMat);
    leftTopBeam.position.set(-2.05, 2.18, 0);
    fenceGroup.add(leftTopBeam);

    // Left corner pillar at x = -2.75
    const leftEndPost = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.35, 0.28), whiteMat);
    leftEndPost.position.set(-2.75, 1.175, 0);
    leftEndPost.castShadow = true;
    fenceGroup.add(leftEndPost);

    // C. RIGHT FENCE SECTION (x = +1.35 to +2.75)
    // Stacked stone base
    const rightStoneBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.46, 0.22), stoneMat);
    rightStoneBase.position.set(2.05, 0.23, 0);
    rightStoneBase.castShadow = true;
    fenceGroup.add(rightStoneBase);

    // Vertical dark iron pickets (6 bars)
    for (let i = 0; i < 6; i++) {
      const barX = 1.6 + i * 0.18;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.045, 1.6, 0.045), metalMat);
      bar.position.set(barX, 1.3, 0);
      bar.castShadow = true;
      fenceGroup.add(bar);
    }

    // White top header beam capping right pickets
    const rightTopBeam = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.22), whiteMat);
    rightTopBeam.position.set(2.05, 2.18, 0);
    fenceGroup.add(rightTopBeam);

    // Right corner pillar at x = +2.75
    const rightEndPost = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.35, 0.28), whiteMat);
    rightEndPost.position.set(2.75, 1.175, 0);
    rightEndPost.castShadow = true;
    fenceGroup.add(rightEndPost);

    this.rootGroup.add(fenceGroup);
  }

  /**
   * 3. COURTYARD, ZEN ROCK GARDEN & SIDEWALK (my-housing.mp4 00:01 - 00:03)
   */
  private buildCourtyardAndZenGarden(): void {
    // Courtyard stone paving (z = 1.4 to 7.4)
    const courtyardMat = new THREE.MeshStandardMaterial({
      color: 0xc4c7cc,
      roughness: 0.65
    });
    const courtyard = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.08, 6.0), courtyardMat);
    courtyard.position.set(0, 0.04, 4.4);
    courtyard.receiveShadow = true;
    this.rootGroup.add(courtyard);

    // Left zen rock garden (my-housing.mp4 00:01 - 00:03)
    const zenGroup = new THREE.Group();
    zenGroup.position.set(-1.9, 0.08, 4.8);

    // Pebble gravel bedding
    const gravelBed = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.04, 3.6),
      new THREE.MeshStandardMaterial({ color: 0xd8dadf, roughness: 0.92 })
    );
    gravelBed.position.set(0, 0.02, 0);
    zenGroup.add(gravelBed);

    // Natural river boulders
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x4a515c, roughness: 0.8 });
    [
      { x: -0.2, z: -1.0, s: 0.28 },
      { x: 0.15, z: -0.4, s: 0.38 },
      { x: -0.15, z: 0.45, s: 0.32 },
      { x: 0.2, z: 1.1, s: 0.25 }
    ].forEach((r) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r.s, 1), rockMat);
      rock.position.set(r.x, r.s * 0.8, r.z);
      rock.scale.set(1.2, 0.8, 1.0);
      rock.castShadow = true;
      zenGroup.add(rock);
    });

    // Clipped green mounds
    const shrubMat = new THREE.MeshStandardMaterial({ color: 0x336324, roughness: 0.75 });
    [
      { x: -0.1, z: -0.6, s: 0.32 },
      { x: 0.2, z: 0.1, s: 0.36 },
      { x: -0.1, z: 0.8, s: 0.3 }
    ].forEach((sh) => {
      const shrub = new THREE.Mesh(new THREE.SphereGeometry(sh.s, 8, 8), shrubMat);
      shrub.position.set(sh.x, sh.s * 0.9, sh.z);
      shrub.castShadow = true;
      zenGroup.add(shrub);
    });

    // Pink Bougainvillea flowering bush (Hoa giấy hồng my-housing.mp4 00:02)
    const flowerBush = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), this.materials.flowerMaterial);
    flowerBush.position.set(0.05, 0.55, -1.2);
    flowerBush.castShadow = true;
    zenGroup.add(flowerBush);

    this.rootGroup.add(zenGroup);

    // Right green hedge along the right perimeter wall (my-housing.mp4 00:00)
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x2e5c21, roughness: 0.8 });
    const rightHedge = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.7, 5.8), hedgeMat);
    rightHedge.position.set(2.45, 0.35, 4.4);
    rightHedge.castShadow = true;
    this.rootGroup.add(rightHedge);

    // Side walkway along left side of the house going towards back (my-housing.mp4 00:00)
    const walkwayMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.7 });
    const walkway = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 4.0), walkwayMat);
    walkway.position.set(-2.25, 0.04, -0.6);
    this.rootGroup.add(walkway);

    // Potted plant against the left wall
    const sidePot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.5, 12), this.materials.darkMetalMaterial);
    sidePot.position.set(-2.25, 0.25, 0.8);
    this.rootGroup.add(sidePot);

    const sidePlant = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), this.materials.foliageMaterial);
    sidePlant.position.set(-2.25, 0.7, 0.8);
    this.rootGroup.add(sidePlant);
  }

  /**
   * 4. 1ST FLOOR (GROUND FLOOR): 3 Cascading Black Marble Steps & Dark Marble Facade Cladding
   * (my-housing.mp4 00:04 - 00:06)
   */
  private buildGroundFloorMarbleFacade(): void {
    const marbleMat = this.materials.slateWallMaterial;

    // 3 Cascading Dark Polished Marble Steps (z = 2.2 down to 1.35, y = 0.0 to 0.42)
    const stepsData = [
      { width: 4.2, height: 0.14, depth: 0.38, z: 2.2 },
      { width: 3.8, height: 0.28, depth: 0.38, z: 1.82 },
      { width: 3.4, height: 0.42, depth: 0.38, z: 1.44 }
    ];

    stepsData.forEach((st) => {
      const step = new THREE.Mesh(new THREE.BoxGeometry(st.width, st.height, st.depth), marbleMat);
      step.position.set(0, st.height / 2, st.z);
      step.receiveShadow = true;
      this.rootGroup.add(step);
    });

    // Porch Landing Slab at y = 0.42 (connects directly to living room floor)
    const porchLanding = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.42, 0.7), marbleMat);
    porchLanding.position.set(0, 0.21, 1.05);
    porchLanding.receiveShadow = true;
    this.rootGroup.add(porchLanding);

    // FULL DARK MARBLE CLAD GROUND FLOOR FACADE (my-housing.mp4 00:04)
    // Left dark marble portal wall (x: -2.3 to -1.35)
    const marbleWallL = new THREE.Mesh(new THREE.BoxGeometry(0.95, 3.2, 0.3), marbleMat);
    marbleWallL.position.set(-1.825, 1.8, 1.4);
    marbleWallL.castShadow = true;
    this.rootGroup.add(marbleWallL);

    // Right dark marble portal wall (x: +1.35 to +2.3)
    const marbleWallR = new THREE.Mesh(new THREE.BoxGeometry(0.95, 3.2, 0.3), marbleMat);
    marbleWallR.position.set(1.825, 1.8, 1.4);
    marbleWallR.castShadow = true;
    this.rootGroup.add(marbleWallR);

    // Top dark marble header lintel beam
    const marbleTop = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.48, 0.4), marbleMat);
    marbleTop.position.set(0, 3.24, 1.4);
    marbleTop.castShadow = true;
    this.rootGroup.add(marbleTop);

    // Modern vertical black wall sconces with up-down light (my-housing.mp4 00:04)
    [-1.65, 1.65].forEach((sx) => {
      const sconceBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.6, 12),
        this.materials.darkMetalMaterial
      );
      sconceBody.position.set(sx, 1.95, 1.58);
      this.rootGroup.add(sconceBody);

      const topGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8), this.materials.sconceGlowMaterial);
      topGlow.position.set(sx, 2.27, 1.58);
      this.rootGroup.add(topGlow);

      const botGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8), this.materials.sconceGlowMaterial);
      botGlow.position.set(sx, 1.63, 1.58);
      this.rootGroup.add(botGlow);
    });
  }

  /**
   * 5. ENTRANCE DOUBLE GLASS DOORS & TRANSLUCENT SHEER CURTAINS (my-housing.mp4 00:05 - 00:07)
   */
  private buildFrontEntranceAndDoors(): void {
    const clearGlass = this.materials.glassMaterial;
    const metalMat = this.materials.darkMetalMaterial;

    // Translucent white sheer curtains gathered on sides (my-housing.mp4 00:06 - 00:08)
    const curtainMat = new THREE.MeshStandardMaterial({
      color: 0xfdfdfd,
      emissive: 0xffecd0,
      emissiveIntensity: 0.45,
      roughness: 0.85,
      side: THREE.DoubleSide
    });

    const curtainL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 2.5, 12), curtainMat);
    curtainL.position.set(-1.2, 1.65, 1.25);
    this.rootGroup.add(curtainL);

    const curtainR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 2.5, 12), curtainMat);
    curtainR.position.set(1.2, 1.65, 1.25);
    this.rootGroup.add(curtainR);

    // DOUBLE PIVOTING GLASS DOORS (z = 1.38, entrance width = 2.6m)
    // Create hollow door leaf with outer rails/stiles and clear central glass pane
    const buildDoorLeaf = (group: THREE.Group, isLeft: boolean) => {
      const doorW = 1.22;
      const doorH = 2.5;
      const border = 0.07;
      const leafGroup = new THREE.Group();
      leafGroup.position.set(isLeft ? doorW / 2 : -doorW / 2, doorH / 2, 0);

      // Top rail
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(doorW, border, 0.05), metalMat);
      topRail.position.set(0, doorH / 2 - border / 2, 0);
      leafGroup.add(topRail);

      // Bottom kickplate rail
      const botRail = new THREE.Mesh(new THREE.BoxGeometry(doorW, border * 1.5, 0.05), metalMat);
      botRail.position.set(0, -doorH / 2 + (border * 1.5) / 2, 0);
      leafGroup.add(botRail);

      // Left stile
      const leftStile = new THREE.Mesh(new THREE.BoxGeometry(border, doorH - border * 2.5, 0.05), metalMat);
      leftStile.position.set(-doorW / 2 + border / 2, 0, 0);
      leafGroup.add(leftStile);

      // Right stile
      const rightStile = new THREE.Mesh(new THREE.BoxGeometry(border, doorH - border * 2.5, 0.05), metalMat);
      rightStile.position.set(doorW / 2 - border / 2, 0, 0);
      leafGroup.add(rightStile);

      // Center Glass Pane (Crystal clear)
      const glassPane = new THREE.Mesh(
        new THREE.BoxGeometry(doorW - border * 2, doorH - border * 2.5, 0.02),
        clearGlass
      );
      leafGroup.add(glassPane);

      // Vertical pull handle
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.85, 8), metalMat);
      handle.position.set(isLeft ? doorW / 2 - 0.08 : -doorW / 2 + 0.08, 0, 0.04);
      leafGroup.add(handle);

      group.add(leafGroup);
    };

    // Left Door Leaf (pivots outward at x = -1.25)
    this.leftDoorGroup.position.set(-1.25, 0.42, 1.38);
    buildDoorLeaf(this.leftDoorGroup, true);

    // Right Door Leaf (pivots outward at x = +1.25)
    this.rightDoorGroup.position.set(1.25, 0.42, 1.38);
    buildDoorLeaf(this.rightDoorGroup, false);

    this.rootGroup.add(this.leftDoorGroup);
    this.rootGroup.add(this.rightDoorGroup);
    this.rootGroup.add(this.frontDoorGroup);
    this.rootGroup.add(this.customRoomGroup);
  }

  /**
   * 6. 2ND FLOOR: ORGANIC CURVED WHITE HOLLOW FRAME & 4-PANEL WINDOW (my-housing.mp4 00:00 - 00:03)
   */
  private buildSecondFloorCurvedFacade(): void {
    const floor2Group = new THREE.Group();
    floor2Group.position.set(0, 3.48, 1.2);

    const whiteMat = this.materials.exteriorWallMaterial;
    const darkSlotMat = new THREE.MeshStandardMaterial({ color: 0x22262a, roughness: 0.55 });
    const metalMat = this.materials.darkMetalMaterial;

    // A. Left vertical dark column slot (x = -2.3 to -1.35)
    const leftCol = new THREE.Mesh(new THREE.BoxGeometry(0.95, 3.4, 0.35), darkSlotMat);
    leftCol.position.set(-1.825, 1.7, 0);
    leftCol.castShadow = true;
    floor2Group.add(leftCol);

    // Floating cantilevered white planter box (my-housing.mp4 00:01)
    const planterBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.38, 0.45), whiteMat);
    planterBox.position.set(-1.825, 2.4, 0.15);
    planterBox.castShadow = true;
    floor2Group.add(planterBox);

    // Pink Bougainvillea flowering plants in the planter
    const plant = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), this.materials.foliageMaterial);
    plant.position.set(-1.825, 2.7, 0.15);
    floor2Group.add(plant);

    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.24, 6, 6), this.materials.flowerMaterial);
    flower.position.set(-1.825, 2.8, 0.22);
    floor2Group.add(flower);

    // Two black sconces on left column (one above, one below planter)
    [1.5, 3.0].forEach((sy) => {
      const sconce = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), metalMat);
      sconce.position.set(-1.825, sy, 0.2);
      floor2Group.add(sconce);

      const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 8), this.materials.sconceGlowMaterial);
      glow.position.set(-1.825, sy, 0.2);
      floor2Group.add(glow);
    });

    // B. HOLLOW WHITE ORGANIC CURVED ALCOVE (x = -1.35 to +2.3)
    // 1. Top curved header ledge (y = 3.05 to 3.4)
    const topHeader = new THREE.Mesh(
      new THREE.BoxGeometry(3.65, 0.35, 0.65),
      whiteMat
    );
    topHeader.position.set(0.475, 3.225, 0);
    topHeader.castShadow = true;
    floor2Group.add(topHeader);

    // 2. Bottom curved shelf apron (y = 0.0 to 0.35)
    const bottomApron = new THREE.Mesh(
      new THREE.BoxGeometry(3.65, 0.35, 0.65),
      whiteMat
    );
    bottomApron.position.set(0.475, 0.175, 0);
    bottomApron.castShadow = true;
    floor2Group.add(bottomApron);

    // 3. Left vertical border post (x = -1.35 to -1.15)
    const leftPost = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.7, 0.65),
      whiteMat
    );
    leftPost.position.set(-1.25, 1.7, 0);
    floor2Group.add(leftPost);

    // 4. Right organic curved casing wall (x = 2.05 to 2.3)
    const rightPost = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 2.7, 0.65),
      whiteMat
    );
    rightPost.position.set(2.175, 1.7, 0);
    floor2Group.add(rightPost);

    // 5. Rounded top-right and bottom-right corner filler bevels
    const cornerTR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.65, 16, 1, false, 0, Math.PI / 2),
      whiteMat
    );
    cornerTR.rotation.x = Math.PI / 2;
    cornerTR.position.set(1.95, 3.05, 0);
    floor2Group.add(cornerTR);

    const cornerBR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.65, 16, 1, false, -Math.PI / 2, Math.PI / 2),
      whiteMat
    );
    cornerBR.rotation.x = Math.PI / 2;
    cornerBR.position.set(1.95, 0.35, 0);
    floor2Group.add(cornerBR);

    // C. HOLLOW 4-PANEL BLACK FRAMED WINDOW (recessed back to z = -0.28)
    const winGroup = new THREE.Group();
    winGroup.position.set(0.45, 1.7, -0.28);

    const winW = 3.0;
    const winH = 2.6;
    const wBorder = 0.06;

    // Window Outer Frame: Top, Bottom, Left, Right
    const wTop = new THREE.Mesh(new THREE.BoxGeometry(winW, wBorder, 0.06), metalMat);
    wTop.position.set(0, winH / 2 - wBorder / 2, 0);
    winGroup.add(wTop);

    const wBot = new THREE.Mesh(new THREE.BoxGeometry(winW, wBorder, 0.06), metalMat);
    wBot.position.set(0, -winH / 2 + wBorder / 2, 0);
    winGroup.add(wBot);

    const wLeft = new THREE.Mesh(new THREE.BoxGeometry(wBorder, winH - wBorder * 2, 0.06), metalMat);
    wLeft.position.set(-winW / 2 + wBorder / 2, 0, 0);
    winGroup.add(wLeft);

    const wRight = new THREE.Mesh(new THREE.BoxGeometry(wBorder, winH - wBorder * 2, 0.06), metalMat);
    wRight.position.set(winW / 2 - wBorder / 2, 0, 0);
    winGroup.add(wRight);

    // 3 Vertical Mullions (creating 4 balanced window panels)
    [-0.75, 0.0, 0.75].forEach((mx) => {
      const mul = new THREE.Mesh(new THREE.BoxGeometry(0.04, winH - wBorder * 2, 0.05), metalMat);
      mul.position.set(mx, 0, 0);
      winGroup.add(mul);
    });

    // Crystal clear glass pane
    const winGlass = new THREE.Mesh(
      new THREE.BoxGeometry(winW - wBorder * 2, winH - wBorder * 2, 0.02),
      this.materials.glassMaterial
    );
    winGroup.add(winGlass);

    floor2Group.add(winGroup);

    // White sheer curtains behind window with warm interior light (my-housing.mp4 00:00)
    const winCurtain = new THREE.Mesh(
      new THREE.PlaneGeometry(winW - 0.08, winH - 0.08),
      new THREE.MeshStandardMaterial({
        color: 0xfffcf5,
        emissive: 0xffe6be,
        emissiveIntensity: 0.75,
        roughness: 0.85,
        side: THREE.DoubleSide
      })
    );
    winCurtain.position.set(0.45, 1.7, -0.32);
    floor2Group.add(winCurtain);

    // Warm ambient glow behind 2nd floor curtains
    const f2Glow = new THREE.PointLight(0xffdfa0, 2.0, 6.0);
    f2Glow.position.set(0.45, 2.0, -0.8);
    floor2Group.add(f2Glow);

    this.rootGroup.add(floor2Group);
  }

  /**
   * 7. 3RD FLOOR / ROOFTOP SKY TERRACE WITH BLACK PERGOLA & PALM FOLIAGE
   * (my-housing.mp4 00:00)
   */
  private buildThirdFloorTerrace(): void {
    const terraceGroup = new THREE.Group();
    terraceGroup.position.set(0, 6.9, 1.2);

    const whiteMat = this.materials.exteriorWallMaterial;
    const darkSlotMat = new THREE.MeshStandardMaterial({ color: 0x22262a, roughness: 0.55 });
    const metalMat = this.materials.darkMetalMaterial;

    // Left dark column continuation (x = -2.3 to -1.35, height 2.5m)
    const leftRoofCol = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.5, 0.35), darkSlotMat);
    leftRoofCol.position.set(-1.825, 1.25, 0);
    leftRoofCol.castShadow = true;
    terraceGroup.add(leftRoofCol);

    // Small planter box on 3rd floor left with pink bougainvillea
    const planter3 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.35, 0.4), whiteMat);
    planter3.position.set(-1.825, 1.6, 0.15);
    terraceGroup.add(planter3);

    const plant3 = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 6), this.materials.flowerMaterial);
    plant3.position.set(-1.825, 1.9, 0.18);
    terraceGroup.add(plant3);

    // Crisp solid white front parapet wall (x = -1.35 to +2.3, height 1.05m)
    const frontParapet = new THREE.Mesh(new THREE.BoxGeometry(3.65, 1.05, 0.25), whiteMat);
    frontParapet.position.set(0.475, 0.525, 0.1);
    frontParapet.castShadow = true;
    terraceGroup.add(frontParapet);

    // Right perimeter roof wall extending to top
    const rightRoofWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.5, 2.5), whiteMat);
    rightRoofWall.position.set(2.175, 1.25, -1.0);
    rightRoofWall.castShadow = true;
    terraceGroup.add(rightRoofWall);

    // Left perimeter roof wall extending to top
    const leftRoofWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.5, 2.5), whiteMat);
    leftRoofWall.position.set(-2.175, 1.25, -1.0);
    leftRoofWall.castShadow = true;
    terraceGroup.add(leftRoofWall);

    // Horizontal black steel pergola louvers across the top (my-housing.mp4 00:00)
    for (let i = 0; i < 6; i++) {
      const louver = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.08, 0.16), metalMat);
      louver.position.set(0, 2.45, -0.1 - i * 0.42);
      louver.castShadow = true;
      terraceGroup.add(louver);
    }

    // Lush rooftop tropical palms & foliage (my-housing.mp4 00:00)
    // Create authentic fan palm fronds fanning upward behind front parapet
    const palmFrondMat = new THREE.MeshStandardMaterial({
      color: 0x24551c,
      roughness: 0.65,
      side: THREE.DoubleSide
    });

    [-0.4, 0.5, 1.3].forEach((px) => {
      const palmGroup = new THREE.Group();
      palmGroup.position.set(px, 1.1, -0.35);

      // Multiple fan palm blades radiating in an arc
      for (let f = -3; f <= 3; f++) {
        const frond = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.1, 4), palmFrondMat);
        frond.rotation.z = (f * Math.PI) / 10;
        frond.rotation.x = -0.18;
        frond.position.set(f * 0.07, 0.55, 0);
        frond.scale.set(1.0, 1.0, 0.15);
        frond.castShadow = true;
        palmGroup.add(frond);
      }
      terraceGroup.add(palmGroup);
    });

    // Cascading pink bougainvillea flowers spilling over the front parapet (my-housing.mp4 00:00)
    const cascadeFlower = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), this.materials.flowerMaterial);
    cascadeFlower.position.set(1.6, 1.1, 0.22);
    cascadeFlower.scale.set(1.4, 0.75, 1.0);
    cascadeFlower.castShadow = true;
    terraceGroup.add(cascadeFlower);

    const cascadeFlower2 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 6), this.materials.flowerMaterial);
    cascadeFlower2.position.set(-0.85, 1.02, 0.2);
    cascadeFlower2.castShadow = true;
    terraceGroup.add(cascadeFlower2);

    this.roofGroup.add(terraceGroup);
    this.rootGroup.add(this.roofGroup);
  }

  /**
   * 8. INTERIOR SHELL (Receives livingroom.glb)
   */
  private buildInteriorShell(): void {
    // Floor slab
    const floor = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.2, 10.0), this.materials.floorMaterial);
    floor.position.set(0, 0.305, -3.6);
    floor.receiveShadow = true;
    this.livingGroup.add(floor);
    this.floorMeshes.push(floor);

    // White perimeter walls
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 10.0), this.materials.wallMaterial);
    leftWall.position.set(-2.4, 1.8, -3.6);
    leftWall.receiveShadow = true;
    this.livingGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 10.0), this.materials.wallMaterial);
    rightWall.position.set(2.4, 1.8, -3.6);
    rightWall.receiveShadow = true;
    this.livingGroup.add(rightWall);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.2, 0.2), this.materials.wallMaterial);
    backWall.position.set(0, 1.8, -8.6);
    backWall.receiveShadow = true;
    this.livingGroup.add(backWall);

    this.rootGroup.add(this.livingGroup);
    this.rootGroup.add(this.customRoomGroup);
  }

  public mountCustomRoom(roomGroup: THREE.Group): void {
    this.livingGroup.visible = false;
    while (this.customRoomGroup.children.length > 0) {
      this.customRoomGroup.remove(this.customRoomGroup.children[0]);
    }
    this.customRoomGroup.add(roomGroup);
  }

  public unmountCustomRoom(): void {
    while (this.customRoomGroup.children.length > 0) {
      this.customRoomGroup.remove(this.customRoomGroup.children[0]);
    }
    this.livingGroup.visible = true;
  }

  public setDoorOpenProgress(progress: number): void {
    const clamped = Math.max(0, Math.min(1.0, progress));
    const targetAngle = clamped * (Math.PI * 0.44); // ~80 degrees opening
    this.leftDoorGroup.rotation.y = targetAngle;
    this.rightDoorGroup.rotation.y = -targetAngle;
    this.frontDoorGroup.rotation.y = -targetAngle;
  }

  public setLivingFurnitureVisibility(visible: boolean): void {
    if (this.customRoomGroup.children.length === 0) {
      this.livingGroup.visible = visible;
    }
  }

  public setRoofVisibility(visible: boolean): void {
    this.roofGroup.visible = visible;
    this.customRoomGroup.traverse((child) => {
      if (child.userData && child.userData.isCeiling) {
        child.visible = visible;
      }
    });
  }

  public updateSofaColor(hexColor: string, roughness: number = 0.85): void {
    this.materials.sofaMaterial.color.set(hexColor);
    this.materials.sofaMaterial.roughness = roughness;
    this.materials.sofaMaterial.needsUpdate = true;
  }

  public updateFloorMaterial(hexColor: string, roughness: number = 0.35): void {
    this.materials.floorMaterial.color.set(hexColor);
    this.materials.floorMaterial.roughness = roughness;
    this.materials.floorMaterial.needsUpdate = true;
  }

  public updateWallColor(hexColor: string): void {
    this.materials.wallMaterial.color.set(hexColor);
    this.materials.wallMaterial.needsUpdate = true;
  }

  public dispose(): void {
    this.rootGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      }
    });
  }
}
