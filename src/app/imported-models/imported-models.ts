import { AfterViewInit, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'lil-gui';

@Component({
  selector: 'app-imported-models',
  imports: [],
  templateUrl: './imported-models.html',
  styleUrl: './imported-models.scss',
})
export class ImportedModels implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private gui!: GUI;
  private frameId = 0;
  private mixer!: THREE.AnimationMixer;

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
     * Floor
     */
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: '#444444',
      metalness: 0,
      roughness: 0.5
    });
    this.disposables.push(floorGeometry, floorMaterial);

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.rotation.x = - Math.PI * 0.5;
    scene.add(floor);

    /**
     * Lights
     */
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.camera.left = - 7;
    directionalLight.shadow.camera.top = 7;
    directionalLight.shadow.camera.right = 7;
    directionalLight.shadow.camera.bottom = - 7;
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // GLTF Loader
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      // 'assets/models/FlightHelmet/glTF/FlightHelmet.gltf',
      'assets/models/Fox/glTF/Fox.gltf',
      (gltf) => {
        console.log('Loaded model:', gltf);
        scene.add(gltf.scene);
        scene.add(gltf.scene.children[0]);
        for(var i = 0; i < gltf.scene.children.length; i++) {
          scene.add(gltf.scene.children[i]);
        }        
        const helmetChildern = [...gltf.scene.children];
        for (const child of helmetChildern) {
          scene.add(child);
        }
        // gltf.scene.scale.set(0.025, 0.025, 0.025);
        // scene.add(gltf.scene);
        // this.mixer = new THREE.AnimationMixer(gltf.scene);
        // const action = this.mixer.clipAction(gltf.animations[2]);
        // action.play();
      }
    );

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
    this.camera.position.set(2, 2, 2);
    scene.add(this.camera);

    // Controls
    const controls = new OrbitControls(this.camera, this.canvas().nativeElement);
    controls.target.set(0, 0.75, 0);
    controls.enableDamping = true;
    this.disposables.push(controls);

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
    const tick = () => {
      const deltaTime = clock.getDelta();
      // Update controls
      controls.update();

      // Render
      this.renderer.render(scene, this.camera);

      // Call tick again on the next frame
      this.frameId = window.requestAnimationFrame(tick);

      // Update mixer
      if (this.mixer) {
        this.mixer.update(deltaTime);
      }
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
