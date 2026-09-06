import { AfterViewInit, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import { GUI } from 'lil-gui';
import * as THREE from 'three';

@Component({
  selector: 'app-scroll-animation',
  imports: [],
  templateUrl: './scroll-animation.html',
  styleUrl: './scroll-animation.scss',
})
export class ScrollAnimation implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  ngAfterViewInit(): void {
    const gui = new GUI()

    const parameters = {
        materialColor: '#ffeded'
    }

    gui
        .addColor(parameters, 'materialColor')
        .onChange(() => {meshToonMaterial.color.set(parameters.materialColor)})

    // Texture
    const textureLoader = new THREE.TextureLoader();
    const gradientTexture = textureLoader.load('assets/textures/gradients/3.jpg')
    gradientTexture.magFilter = THREE.NearestFilter;

    // Scene
    const scene = new THREE.Scene()

    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    // Cursor
    const cursor = {
      x: 0,
      y: 0
    };

    addEventListener('mousemove', (event) => {
      cursor.x = event.clientX / sizes.width - 0.5
      cursor.y = event.clientY / sizes.height - 0.5
    });

    addEventListener('resize', () =>
    {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        // Update camera
        this.camera.aspect = sizes.width / sizes.height
        this.camera.updateProjectionMatrix()

        // Update renderer
        this.renderer.setSize(sizes.width, sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    /**
     * Camera
     */
    // Base camera
    this.camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
    this.camera.position.z = 6
    scene.add(this.camera)

    // Camera group
    const cameraGroup = new THREE.Group();
    cameraGroup.add(this.camera);
    scene.add(cameraGroup);

    /**
     * Renderer
     */
    this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas().nativeElement,
        alpha: true
    });
    this.renderer.setClearAlpha(0);
    this.renderer.setSize(sizes.width, sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    /**
     * Objects
     */
    // Meshes
    const meshToonMaterial = new THREE.MeshToonMaterial({ color: parameters.materialColor });
    meshToonMaterial.gradientMap = gradientTexture;
    const mesh1 = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.4, 16, 60),
      meshToonMaterial
    );
    const mesh2 = new THREE.Mesh(
      new THREE.ConeGeometry(1, 2, 32),
      meshToonMaterial
    );
    const mesh3 = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
      meshToonMaterial
    );

    scene.add(mesh1, mesh2, mesh3);

    const objectDistance = 4;
    mesh1.position. y = - objectDistance * 0;
    mesh2.position. y = - objectDistance * 1;
    mesh3.position. y = - objectDistance * 2;

    mesh1.position.x = 2
    mesh2.position.x = - 2
    mesh3.position.x = 2

    const sectionMeshes = [ mesh1, mesh2, mesh3 ];

    let scrollY = window.scrollY;
    addEventListener("scroll", () => {
      scrollY = window.scrollY;
    });


    /**
     * Lights
     */
    const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
    directionalLight.position.set(1, 1, 0)
    scene.add(directionalLight)

    /**
     * Animate
     */
    const clock = new THREE.Clock()

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Animate meshes
      for (const mesh of sectionMeshes) {
        mesh.rotation.x = elapsedTime * 0.1
        mesh.rotation.y = elapsedTime * 0.12
      }

      // Animate Camera
      this.camera.position.y = - scrollY / sizes.height * objectDistance;
      const parallaxX = cursor.x;
      const parallaxY = - cursor.y;
      cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 0.1;
      cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 0.1;

      // Render
      this.renderer.render(scene, this.camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    }

    tick()
  }

  ngOnDestroy(): void {
    // Clean up resources if needed
  }
}
