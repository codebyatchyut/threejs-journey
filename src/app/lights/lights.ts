import { AfterViewInit, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';


@Component({
  selector: 'app-lights',
  imports: [],
  templateUrl: './lights.html',
  styleUrl: './lights.scss',
})
export class Lights implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;

  ngAfterViewInit(): void {
    // Scene
    const scene = new THREE.Scene();

    const sizes = {x: window.innerWidth, y: window.innerHeight};

    const gui = new GUI();

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, sizes.x/sizes.y, 0.1, 1000);
    this.camera.position.z = 3;
    const orbitControls = new OrbitControls(this.camera, this.canvas().nativeElement);
    orbitControls.enableDamping = true;

    addEventListener('dblclick', () => {
      if (!document.fullscreenElement) {
        this.canvas().nativeElement.requestFullscreen();
      }
      else {
        document.exitFullscreen();
      }
    })

    addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(sizes.x, sizes.y);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  )

    // Meshes
    const planeGeometry = new THREE.PlaneGeometry(4.5, 3);
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const donutGeometry = new THREE.TorusGeometry(0.25, 0.15, 16, 32);

    const material = new THREE.MeshStandardMaterial;
    material.color = new THREE.Color('white');
    material.side = THREE.DoubleSide;
    
    const plane = new THREE.Mesh(planeGeometry, material);
    plane.rotation.x = -1;
    const sphere = new THREE.Mesh(sphereGeometry, material);
    sphere.position.set(-1, 1.4, -1);
    const cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.set(0, 1, 0);
    const donut = new THREE.Mesh(donutGeometry, material);
    donut.position.set(0.66, 0.7, 1);

    // Adding meshes to the scene
    scene.add(plane, sphere, cube, donut);
    

    // Lights
    // 1. AmbientLigth
    const ambientLight = new THREE.AmbientLight('white', 1);
    scene.add(ambientLight);

    // 2. DirectionalLigth
    const directionalLigth = new THREE.DirectionalLight('blue', 1);
    directionalLigth.position.set(0.2, 0.1, 0.1);
    scene.add(directionalLigth);

    // 3. HemisphereLight
    const hemisphereLight = new THREE.HemisphereLight('green', 'purple', 1);
    scene.add(hemisphereLight);

    // 4. PointLight
    const pointLight = new THREE.PointLight('yellow', 1, 0);
    pointLight.position.set(1, -0.5, 1);
    scene.add(pointLight);

    // 5. RectAreaLight
    const rectareaLight = new THREE.RectAreaLight('orange', 1, 2, 1);
    rectareaLight.position.set(-0.25, 1, 0.5);
    scene.add(rectareaLight);

    // 6. SpotLigth
    const spotLight = new THREE.SpotLight('skyblue', 1);
    scene.add(spotLight);

    // Helpers for lights
    const spotLightHelper = new THREE.SpotLightHelper(spotLight, 0.2);
    scene.add(spotLightHelper);
    const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
    scene.add(pointLightHelper);
    const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2);
    scene.add(hemisphereLightHelper);
    const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLigth, 0.2);
    scene.add(directionalLightHelper);

    // Debug Tweaks
    gui.add(ambientLight, 'intensity').min(0).max(5).step(0.01);
    gui.add(directionalLigth, 'intensity').min(0).max(5).step(0.01);
    gui.add(hemisphereLight, 'intensity').min(0).max(5).step(0.01);
    gui.add(pointLight, 'intensity').min(0).max(5).step(0.01);
    gui.add(rectareaLight, 'intensity').min(0).max(5).step(0.01);
    gui.add(spotLight, 'intensity').min(0).max(5).step(0.01);

    // WebglRenderer
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas().nativeElement});
    this.renderer.setSize(sizes.x, sizes.y);
    this.renderer.render(scene, this.camera);

    // Animation
    const clock = new THREE.Clock();
    const tick = () => {
      sphere.rotation.x = 0.2 * clock.getElapsedTime();
      cube.rotation.x = 0.2 * clock.getElapsedTime();
      donut.rotation.x = 0.2 * clock.getElapsedTime();
      sphere.rotation.y = 0.2 * clock.getElapsedTime();
      cube.rotation.y = 0.2 * clock.getElapsedTime();
      donut.rotation.y = 0.2 * clock.getElapsedTime();
      orbitControls.update();
      this.renderer.render(scene, this.camera);
      requestAnimationFrame(tick);
    }
    
    tick();
  }

  ngOnDestroy(): void {
    this.renderer.dispose();
  }
}
