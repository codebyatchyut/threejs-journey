import { AfterViewInit, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import CANNON, { Body, ContactMaterial } from 'cannon';

/** A plain {x, y, z} spawn point — accepted by both THREE and CANNON. */
interface Position {
  x: number;
  y: number;
  z: number;
}

/** The shape of the `collide` event cannon emits on a body. */
interface CollideEvent {
  contact: { getImpactVelocityAlongNormal(): number };
}

@Component({
  selector: 'app-physics-world',
  imports: [],
  templateUrl: './physics-world.html',
  styleUrl: './physics-world.scss',
})
export class PhysicsWorld implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private gui!: GUI;
  private frameId = 0;

  /** Cancels every window listener registered in ngAfterViewInit. */
  private readonly listeners = new AbortController();

  /** Shared GPU resources, released in ngOnDestroy. */
  private readonly disposables: { dispose(): void }[] = [];

  ngAfterViewInit(): void {
    /**
     * Debug
     */
    this.gui = new GUI();
    const debugObject: {createSphere?: () => void; createBox?: () => void; reset?: () => void} = {};

    // Scene
    const scene = new THREE.Scene();

    /**
     * Textures
     */
    const cubeTextureLoader = new THREE.CubeTextureLoader();

    const environmentMapTexture = cubeTextureLoader.load([
      'assets/textures/environmentMaps/0/px.png',
      'assets/textures/environmentMaps/0/nx.png',
      'assets/textures/environmentMaps/0/py.png',
      'assets/textures/environmentMaps/0/ny.png',
      'assets/textures/environmentMaps/0/pz.png',
      'assets/textures/environmentMaps/0/nz.png'
    ]);
    this.disposables.push(environmentMapTexture);

    // Sound
    const hitSound = new Audio('assets/textures/sounds/hit.mp3');
    const playHitSound = (collision: CollideEvent) => {
      const impactStrength = collision.contact.getImpactVelocityAlongNormal();
      if (impactStrength > 1.5) {
        hitSound.volume = Math.random();
        hitSound.currentTime = 0;
        // Autoplay can be blocked until the user has interacted with the page.
        hitSound.play().catch(() => {});
      }
    };

    /**
     * Physics world
     */
    const world = new CANNON.World();
    world.gravity.set(0, - 9.82, 0);

    // Only test pairs whose bounding volumes overlap, instead of every pair.
    world.broadphase = new CANNON.SAPBroadphase(world);
    // Let bodies that have come to rest drop out of the simulation.
    world.allowSleep = true;

    const defaultMaterial = new CANNON.Material('default');

    // Friction and restitution to apply when two default-material bodies collide
    const defaultContactMaterial = new ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      {
        friction: 0.1,
        restitution: 0.7
      }
    );
    world.addContactMaterial(defaultContactMaterial);
    world.defaultContactMaterial = defaultContactMaterial;

    /**
     * Shared geometry and material
     *
     * Built once at unit size and scaled per instance, so every sphere and box
     * reuses one geometry, one material and one compiled shader program.
     */
    const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const objectMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.3,
      roughness: 0.4,
      envMap: environmentMapTexture,
      envMapIntensity: 0.5
    });
    this.disposables.push(sphereGeometry, boxGeometry, objectMaterial);

    const objectsToUpdate: { mesh: THREE.Mesh; body: Body }[] = [];

    /** Adds a mesh/body pair to the scene, the physics world and the update list. */
    const addObject = (mesh: THREE.Mesh, body: Body, position: Position) => {
      mesh.castShadow = true;
      mesh.position.set(position.x, position.y, position.z);
      scene.add(mesh);

      body.position.set(position.x, position.y, position.z);
      body.addEventListener('collide', playHitSound);
      world.addBody(body);

      objectsToUpdate.push({ mesh, body });
    };

    // Adding Spheres
    const createSphere = (radius: number, position: Position) => {
      const mesh = new THREE.Mesh(sphereGeometry, objectMaterial);
      mesh.scale.setScalar(radius);

      const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Sphere(radius),
        material: defaultMaterial
      });

      addObject(mesh, body, position);
    };

    // Adding Boxes
    const createBox = (width: number, height: number, depth: number, position: Position) => {
      const mesh = new THREE.Mesh(boxGeometry, objectMaterial);
      mesh.scale.set(width, height, depth);

      const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(
          new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
        ),
        material: defaultMaterial
      });

      addObject(mesh, body, position);
    };

    /**
     * Floor
     */
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: '#777777',
      metalness: 0.3,
      roughness: 0.4,
      envMap: environmentMapTexture,
      envMapIntensity: 0.5
    });
    this.disposables.push(floorGeometry, floorMaterial);

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.rotation.x = - Math.PI * 0.5;
    scene.add(floor);

    // CANNON floor body
    const floorBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: defaultMaterial
    });
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5
    );
    world.addBody(floorBody);

    // Resetbutton
    const reset = () => {
      for (const object of objectsToUpdate) {
        object.body.removeEventListener('collide', playHitSound);
        world.remove(object.body);
        scene.remove(object.mesh);
      }

      objectsToUpdate.length = 0;
    };

    /**
     * Lights
     */
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.camera.left = - 7;
    directionalLight.shadow.camera.top = 7;
    directionalLight.shadow.camera.right = 7;
    directionalLight.shadow.camera.bottom = - 7;
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    window.addEventListener('resize', () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // Update camera
      this.camera.aspect = sizes.width / sizes.height;
      this.camera.updateProjectionMatrix();

      // Update renderer
      this.renderer.setSize(sizes.width, sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }, { signal: this.listeners.signal });

    /**
     * Camera
     */
    // Base camera
    this.camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    this.camera.position.set(- 3, 3, 3);
    scene.add(this.camera);

    // Controls
    const controls = new OrbitControls(this.camera, this.canvas().nativeElement);
    controls.enableDamping = true;
    this.disposables.push(controls);

    /**
     * Debug tweaks
     */
    const randomPosition = (): Position => ({
      x: (Math.random() - 0.5) * 3,
      y: 3,
      z: (Math.random() - 0.5) * 3
    });

    debugObject.createSphere = () => {
      createSphere(Math.random() * 0.5, randomPosition());
    };

    debugObject.createBox = () => {
      createBox(Math.random(), Math.random(), Math.random(), randomPosition());
    };

    debugObject.reset = reset;

    this.gui.add(debugObject, 'createSphere');
    this.gui.add(debugObject, 'createBox');
    this.gui.add(debugObject, 'reset');

    /**
     * Renderer
     */
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas().nativeElement
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(sizes.width, sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /**
     * Animate
     */
    const clock = new THREE.Clock();
    let oldElapsedTime = 0;
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - oldElapsedTime;
      oldElapsedTime = elapsedTime;

      // Update Physics World
      world.step(1 / 60, deltaTime, 3);
      for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
      }

      // Update controls
      controls.update();

      // Render
      this.renderer.render(scene, this.camera);

      // Call tick again on the next frame
      this.frameId = window.requestAnimationFrame(tick);
    };

    tick();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.listeners.abort();
    this.gui.destroy();

    for (const disposable of this.disposables) {
      disposable.dispose();
    }

    this.renderer.dispose();
  }
}
