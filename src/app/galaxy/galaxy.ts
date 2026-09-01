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

    // Galaxy Properties
    const galaxyProperties = {
      count: 10000,
      size: 0.01,
    };

    let galaxyGeometry: THREE.BufferGeometry | null = null;
    let galaxyMaterial: THREE.PointsMaterial | null = null;
    let particles: THREE.Points | null = null;

    // Galaxy Generation Function
    const generateGalaxy = () => {
      if (particles !== null) {
        galaxyGeometry?.dispose();
        galaxyMaterial?.dispose();
        scene.remove(particles);
      }

      // Geometry
      galaxyGeometry = new THREE.BufferGeometry();
      // Float32Array
      const positions = new Float32Array(galaxyProperties.count * 3);
      for(let i = 0; i < galaxyProperties.count; i++) {
        let i3 = i * 3;
        positions[i3 + 0] = (Math.random() - 0.5);
        positions[i3 + 1] = (Math.random() - 0.5);
        positions[i3 + 2] = (Math.random() - 0.5);
      }
      const bufferattribute = new THREE.BufferAttribute(positions, 3);
      galaxyGeometry.setAttribute('position', bufferattribute);

      // Material
      galaxyMaterial = new THREE.PointsMaterial();
      galaxyMaterial.size = galaxyProperties.size;
      galaxyMaterial.sizeAttenuation = true;

      // Particles
      particles = new THREE.Points(galaxyGeometry, galaxyMaterial);
      scene.add(particles);
    }

    // Galaxy Tweaks
    gui.add(galaxyProperties, 'count').min(100).max(100000).step(10).onFinishChange(generateGalaxy);
    gui.add(galaxyProperties, 'size').min(0.001).max(0.1).step(0.001).onChange(generateGalaxy);


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
