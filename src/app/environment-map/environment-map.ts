import { AfterViewInit, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import GUI from 'lil-gui';

@Component({
  selector: 'app-environment-map',
  imports: [],
  templateUrl: './environment-map.html',
  styleUrl: './environment-map.scss',
})
export class EnvironmentMap implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private gui!: GUI;
  private frameId = 0;

  /** Cancels every window listener registered in ngAfterViewInit. */
  private readonly listeners = new AbortController();

  /** GPU resources released in ngOnDestroy. */
  private readonly disposables: { dispose(): void }[] = [];

  ngAfterViewInit(): void {
    /**
     * Debug
     */
    this.gui = new GUI();

    // Scene
    const scene = new THREE.Scene();

    /**
     * Environment maps
     */
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const environmentMaps = new Map<string, THREE.Texture>();

    const loadCubeMap = (index: number): THREE.Texture => {
      const key = `LDR ${index}`;
      let texture = environmentMaps.get(key);
      if (!texture) {
        const path = `assets/textures/environmentMaps/${index}/`;
        texture = cubeTextureLoader.load(
          ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((face) => `${path}${face}.png`)
        );
        texture.colorSpace = THREE.SRGBColorSpace;
        environmentMaps.set(key, texture);
        this.disposables.push(texture);
      }
      return texture;
    };

    const applyEnvironment = (texture: THREE.Texture) => {
      scene.environment = texture;
      scene.background = texture;
    };

    const environment = {
      map: 'LDR 0',
      intensity: 1,
      backgroundBlurriness: 0,
      backgroundIntensity: 1,
      rotationY: 0,
    };

    applyEnvironment(loadCubeMap(0));

    const hdrLoader = new HDRLoader();
    const selectMap = (name: string) => {
      if (name !== 'HDR') {
        applyEnvironment(loadCubeMap(Number(name.split(' ')[1])));
        return;
      }

      const cached = environmentMaps.get('HDR');
      if (cached) {
        applyEnvironment(cached);
        return;
      }

      hdrLoader.load('assets/textures/environmentMap/2k.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        environmentMaps.set('HDR', texture);
        this.disposables.push(texture);
        // Ignore the result if the user switched maps while it was loading
        if (environment.map === 'HDR') {
          applyEnvironment(texture);
        }
      });
    };

    const environmentFolder = this.gui.addFolder('Environment');
    environmentFolder
      .add(environment, 'map', ['LDR 0', 'LDR 1', 'LDR 2', 'LDR 3', 'LDR 4', 'HDR'])
      .name('Map')
      .onChange(selectMap);
    environmentFolder
      .add(environment, 'intensity', 0, 10, 0.001)
      .name('Intensity')
      .onChange((value: number) => (scene.environmentIntensity = value));
    environmentFolder
      .add(environment, 'backgroundBlurriness', 0, 1, 0.001)
      .name('Background blur')
      .onChange((value: number) => (scene.backgroundBlurriness = value));
    environmentFolder
      .add(environment, 'backgroundIntensity', 0, 10, 0.001)
      .name('Background intensity')
      .onChange((value: number) => (scene.backgroundIntensity = value));
    environmentFolder
      .add(environment, 'rotationY', 0, Math.PI * 2, 0.001)
      .name('Rotation')
      .onChange((value: number) => {
        scene.environmentRotation.y = value;
        scene.backgroundRotation.y = value;
      });

    /**
     * Torus knot
     */
    const torusKnotGeometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
    const torusKnotMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.3,
      metalness: 1,
      color: 0xaaaaaa,
    });
    this.disposables.push(torusKnotGeometry, torusKnotMaterial);

    const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
    torusKnot.position.set(-4, 4, 0);
    scene.add(torusKnot);

    const materialFolder = this.gui.addFolder('Torus knot');
    materialFolder.add(torusKnotMaterial, 'metalness', 0, 1, 0.001);
    materialFolder.add(torusKnotMaterial, 'roughness', 0, 1, 0.001);

    /**
     * Models
     */
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('assets/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
      gltf.scene.scale.set(10, 10, 10);
      scene.add(gltf.scene);
    });

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
    this.camera.position.set(4, 5, 4);
    scene.add(this.camera);

    // Controls
    const controls = new OrbitControls(this.camera, this.canvas().nativeElement);
    controls.target.y = 3.5;
    controls.enableDamping = true;
    this.disposables.push(controls);

    /**
     * Renderer
     */
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas().nativeElement,
      antialias: true
    });
    this.renderer.setSize(sizes.width, sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /**
     * Animate
     */
    const timer = new THREE.Timer();
    const tick = () => {
      timer.update();
      const elapsedTime = timer.getElapsed();

      // Rotate the torus knot
      torusKnot.rotation.y = elapsedTime * 0.2;

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
