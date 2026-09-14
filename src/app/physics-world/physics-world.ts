import { AfterViewInit, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import CANNON, { Shape } from 'cannon';

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

  ngAfterViewInit(): void {
    /**
     * Debug
     */
    this.gui = new GUI();

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

    /**
     * Test sphere
     */
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
      })
    );
    sphere.castShadow = true;
    sphere.position.y = 0.5;
    scene.add(sphere);

    /**
     * Floor
     */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
      })
    );
    floor.receiveShadow = true;
    floor.rotation.x = - Math.PI * 0.5;
    scene.add(floor);

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
    });

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

    // Physics
    const world = new CANNON.World();
    world.gravity.set(0, - 9.82, 0);

    // CANNON Sphere body
    const sphereShape = new CANNON.Sphere(0.5);
    const sphereBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 3, 0),
      shape: sphereShape
    });

    world.addBody(sphereBody);

    // CANNON floor body
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body();
    floorBody.mass = 0;
    floorBody.addShape(floorShape);
    world.addBody(floorBody);

    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5
    )

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
      sphere.position.copy(sphereBody.position);
      sphere.quaternion.copy(sphereBody.quaternion);

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
    this.gui.destroy();
    this.renderer.dispose();
  }
}
