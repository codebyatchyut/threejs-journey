import { AfterViewInit, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { color } from 'three/src/nodes/tsl/TSLCore.js';
import GUI from 'lil-gui';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

@Component({
  selector: 'app-textures',
  imports: [],
  templateUrl: './textures.html',
  styleUrl: './textures.scss',
})
export class Textures implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('webglCanvas');
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private material!: any;
  private scene!: THREE.Scene;

  ngAfterViewInit(): void {
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    // Create a scene
    this.scene = new THREE.Scene();

    // const image = new Image();
    // const texture = new THREE.Texture(image);
    // image.onload = () => {
    //   texture.needsUpdate = true;
    // }
    // image.src = 'assets/textures/door/color.jpg';

    const loadingManager = new THREE.LoadingManager();
    loadingManager.onStart = () => {
      console.log('loading started');
    }
    loadingManager.onLoad = () => {
      console.log('loading finished');
    }
    loadingManager.onProgress = (url, loaded, total) => {
      console.log(`loading ${url} ${loaded} of ${total}`);
    }
    loadingManager.onError = (url) => {
      console.log(`loading error ${url}`);
    }

    // Textures
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const colorTexture = textureLoader.load('assets/textures/door/color.jpg');
    colorTexture.colorSpace = THREE.SRGBColorSpace;
    const alphaTexture = textureLoader.load('assets/textures/door/alpha.jpg');
    const heightTexture = textureLoader.load('assets/textures/door/height.jpg');
    const metalnessTexture = textureLoader.load('assets/textures/door/metalness.jpg');
    const normalTexture = textureLoader.load('assets/textures/door/normal.jpg');
    const roughnessTexture = textureLoader.load('assets/textures/door/roughness.jpg');
    const matcapTexture = textureLoader.load('assets/textures/matcaps/3.png');
    const ambiendOcclusionTexture = textureLoader.load('assets/textures/door/ambientOcclusion.jpg');
    matcapTexture.colorSpace = THREE.SRGBColorSpace;

    // Fonts
    const loader = new FontLoader();
    loader.load("/fonts/helvetiker_regular.typeface.json", (typeface) => {
      const textGeometry = new TextGeometry(
        "Hello Ram",
        {
          font: typeface,
          size: 0.5,
          depth: 0.2,
          curveSegments: 5,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 3
        }
    );
      const textMaterial = new THREE.MeshNormalMaterial();
      // textMaterial.wireframe = true;
      // textMaterial.matcap = matcapTexture;
      textMaterial.side = THREE.DoubleSide;
      const text = new THREE.Mesh(textGeometry, textMaterial);
      this.scene.add(text);
      textGeometry.center();

      const doughnutGeometry = new THREE.TorusGeometry(0.5, 0.3, 20, 45);
      for (let i = 0; i < 300; i++) {
        const doughnutMesh = new THREE.Mesh(doughnutGeometry, textMaterial);
        this.scene.add(doughnutMesh);
        doughnutMesh.position.x = (Math.random() - 0.5) * 10;
        doughnutMesh.position.y = (Math.random() - 0.5) * 12;
        doughnutMesh.position.z = (Math.random() - 0.5) * 15;
        doughnutMesh.rotation.x = Math.random() * Math.PI;
        doughnutMesh.rotation.y = Math.random() * Math.PI;
        const random = Math.random();
        doughnutMesh.scale.set(random, random, random);
      }
    });



    // colorTexture.repeat.x = 2;
    // colorTexture.wrapS = THREE.MirroredRepeatWrapping;
    // colorTexture.repeat.y = 2;
    // colorTexture.wrapT = THREE.MirroredRepeatWrapping;

    // colorTexture.offset.x = 0.5;
    // colorTexture.wrapS = THREE.MirroredRepeatWrapping;
    // colorTexture.offset.y = 0.5;
    // colorTexture.wrapT = THREE.MirroredRepeatWrapping;

    // colorTexture.rotation = Math.PI / 4;
    // colorTexture.center.x = 0.5;
    // colorTexture.center.y = 0.5;

    //  Resizing the window
    addEventListener('resize', () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      this.camera.aspect = sizes.width / sizes.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(sizes.width, sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    })


    // Materials
    // 1. MeshBasicMaterial
    // this.material = new THREE.MeshBasicMaterial();
    // this.material.map = colorTexture;
    // this.material.color = new THREE.Color('red');
    // this.material.transparent = true;
    // this.material.opacity = 0.3;
    // this.material.side = THREE.DoubleSide;

    // 2. MeshNormalMaterial
    // this.material = new THREE.MeshNormalMaterial();
    // this.material.flatShading = true;

    // 3. MeshMatCapMaterial
    // this.material = new THREE.MeshMatcapMaterial();
    // this.material.matcap = matcapTexture;

    // 4. MeshDepthMaterial
    // this.material = new THREE.MeshDepthMaterial();

    // 5. MeshLambertMaterial
    // this.material = new THREE.MeshLambertMaterial();

    // 6. MeshPhongMaterial
    // this.material = new THREE.MeshPhongMaterial();
    // this.material.shininess = 10000;
    // this.material.specular = new THREE.Color('red');
    
    // 7. MeshToonMaterial
    // this.material = new THREE.MeshToonMaterial();

    // 8. MeshStandardMaterial
    // this.material = new THREE.MeshStandardMaterial();
    // this.material.metalness = 0.7;
    // this.material.roughness = 0.2;
    // this.material.map = colorTexture;
    // this.material.aoMap = ambiendOcclusionTexture;
    // this.material.aoMapIntensity = 1;
    // this.material.displacementMap = heightTexture;
    // this.material.dispalcementScale = 0.1;
    // this.material.metalnessMap = metalnessTexture;
    // this.material.roughnessMap = roughnessTexture;
    // this.material.normalMap = normalTexture;
    // this.material.normalScale.set(0.5, 0.5);
    // this.material.transparent = true;
    // this.material.alphaMap = alphaTexture;

    // 9. MeshPhysicalMaterial
    // this.material = new THREE.MeshPhysicalMaterial();
    // this.material.map = colorTexture;
    // clearcoat
    // this.material.clearcoat = 1;
    // this.material.clearcoatRoughness = 0;
    // sheen
    // this.material.sheen = 1;
    // this.material.sheenRoughness = 0.25;
    // this.material.sheenColor.set(1, 1, 1);
    // iridescence
    // this.material.iridescence = 1;
    // this.material.iridescenceIOR = 1;
    // this.material.iridescenceThicknessRange = [100, 900];
    // Transmission
    // this.material.transmission = 1;
    // this.material.ior = 1.5;
    // this.material.thickness = 0.5;

    //Lights
    // const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    // this.scene.add(ambientLight);
    // const pointLight = new THREE.PointLight(0xffffff, 30);
    // pointLight.position.x = 0.7;
    // pointLight.position.y = 0.6;
    // pointLight.position.z = 1;
    // this.scene.add(pointLight);

    // Create a Mesh
    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // this.material = new THREE.MeshBasicMaterial({ map: colorTexture });

    // lil-gui-tweaks
    // const gui = new GUI();
    // gui.add(this.material, 'metalness').min(0.01).max(3).step(0.001);
    // gui.add(this.material, 'roughness').min(0.01).max(3).step(0.001);
    // gui.add(this.material, 'clearcoat').min(1).max(6).step(0.1);
    // gui.add(this.material, 'clearcoatRoughness').min(0).max(7).step(0.1);
    // gui.add(this.material, 'sheen').min(1).max(10).step(0.1);
    // gui.add(this.material, 'sheenRoughness').min(0.25).max(2).step(0.01);
    // gui.add(this.material, 'iridescence').min(1).max(6).step(0.01);
    // gui.add(this.material, 'iridescenceIOR').min(1).max(5).step(0.01);

    // RGBELoader (Environment maps)
    // const rgbeloader = new RGBELoader();
    // rgbeloader.load('assets/textures/environmentMap/2k.hdr', (environmentMap) => {
    //   environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    //   this.scene.background = environmentMap;
    //   this.scene.environment = environmentMap;
    // });

    // const PlaneGeometry = new THREE.PlaneGeometry(1, 1, 100, 100);
    // const SphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    // const TorousGeometry = new THREE.TorusGeometry(0.4, 0.2, 16, 64);
    // const plane = new THREE.Mesh(PlaneGeometry, this.material);
    // const sphere = new THREE.Mesh(SphereGeometry, this.material);
    // const torous = new THREE.Mesh(TorousGeometry, this.material);
    // this.scene.add(plane, sphere, torous);
    // sphere.position.x = -1.4;
    // torous.position.x = 1.5;


    // Create a camera
    this.camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
    this.camera.position.z = 3;
    this.scene.add(this.camera);

    // orbitControls
    const orbitControls = new OrbitControls(this.camera, this.canvas().nativeElement);
    orbitControls.enableDamping = true;

    // Create a renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas().nativeElement
    });
    this.renderer.setSize(sizes.width, sizes.height);
    this.renderer.render(this.scene, this.camera);

    // Animation loop
    const clock = new THREE.Clock();
    const tick = () => {
      orbitControls.update();
      // plane.rotation.x = 0.2 * clock.getElapsedTime();
      // plane.rotation.y = 0.2 * clock.getElapsedTime();
      // sphere.rotation.x = 0.2 * clock.getElapsedTime();
      // sphere.rotation.y = 0.2 * clock.getElapsedTime();
      // torous.rotation.x = 0.2 * clock.getElapsedTime();
      // torous.rotation.y = 0.2 * clock.getElapsedTime();
      requestAnimationFrame(tick);
      this.renderer.render(this.scene, this.camera);
    }

    tick();
  }


  ngOnDestroy(): void {
    this.renderer.dispose();
    this.camera.clear();
  }
}
