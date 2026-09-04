import { AfterViewInit, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { bufferAttribute } from 'three/src/nodes/accessors/BufferAttributeNode.js';
import GUI from 'lil-gui';

@Component({
  selector: 'app-galaxy',
  imports: [],
  templateUrl: './galaxy.html',
  styleUrl: './galaxy.scss',
})
export class Galaxy implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;

  ngAfterViewInit(): void {
    // Scene
    const scene = new THREE.Scene();

    const gui = new GUI();
    const sizes = { x: window.innerWidth, y: window.innerHeight };

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, sizes.x / sizes.y, 0.1, 1000);
    this.camera.position.z = 3;
    scene.add(this.camera);

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
      sizes.x = window.innerWidth;
      sizes.y = window.innerHeight;

      this.camera.aspect = sizes.x / sizes.y;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(sizes.x, sizes.y);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    })

    // Axes Helper
    const axesHelper = new THREE.AxesHelper();
    scene.add(axesHelper);

    // Galaxy Properties
    const parameters = {
      count: 1000,
      size: 0.1,
      radius: 5,
      branches: 3,
    };

    // Galaxy Generation Function
    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.PointsMaterial | null = null;
    let points: THREE.Points | null = null;
    const generateGalaxy = () => {
      if (points !== null) {
        geometry?.dispose();
        material?.dispose();
        scene.remove(points);
      }
      geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(parameters.count * 3);
      for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const radius = (Math.random() - 0.5) * parameters.radius;
        positions[i3] = radius;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = 0;
      }
      const bufferAttribute = new THREE.BufferAttribute(positions, 3);
      geometry.setAttribute('position', bufferAttribute);

      material = new THREE.PointsMaterial();
      material.size = parameters.size;
      material.sizeAttenuation = true;
      material.depthWrite = false;
      material.blending = THREE.AdditiveBlending;
      points = new THREE.Points(geometry, material);
      scene.add(points);
    }

    // Tweaks
    gui.add(parameters, 'count').min(100).max(10000).step(100).onFinishChange(generateGalaxy);
    gui.add(parameters, 'size').min(0.01).max(0.5).step(0.001).onFinishChange(generateGalaxy);
    gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
    gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);

    generateGalaxy();
    // WebglRenderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas().nativeElement });
    this.renderer.setSize(sizes.x, sizes.y);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.render(scene, this.camera);

    // Animation
    const tick = () => {
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
