import { AfterViewInit, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

@Component({
  selector: 'app-cube',
  standalone: true,
  imports: [],
  templateUrl: './cube.html',
  styleUrl: './cube.scss',
})
export class Cube implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private renderer!: THREE.WebGLRenderer;
  private geometry1?: THREE.BoxGeometry;
  private material?: THREE.MeshBasicMaterial;
  private geometry2?: THREE.SphereGeometry;
  private camera!: THREE.PerspectiveCamera;
  private cursor = { x: 0, y: 0 };

  ngAfterViewInit(): void {
    const scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 1000);
    this.camera.position.z = 5;
    scene.add(this.camera);

    const orbitControls = new OrbitControls(this.camera, this.canvas().nativeElement);
    orbitControls.enableDamping = true;

    const cursorEvent = addEventListener('mousemove', (event) => {
        this.cursor.x = event.clientX / window.innerWidth - 0.5;
        this.cursor.y = event.clientY / window.innerHeight + 0.5;
      });

    const materials = [
      new THREE.MeshBasicMaterial({ color: 'red', wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 'blue', wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 'green', wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 'orange', wireframe: true }),
      new THREE.MeshBasicMaterial({ color: 'white', wireframe: true }),
    ];

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
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
    this.geometry1 = new THREE.BoxGeometry(1, 1, 1, 3, 3, 3);
    this.material = new THREE.MeshBasicMaterial({ color: 'purple', wireframe: true });
    this.geometry2 = new THREE.SphereGeometry(0.67, 32, 32);
    const cube = new THREE.Mesh(this.geometry1, materials);
    const sphere = new THREE.Mesh(this.geometry2, this.material);
    const group = new THREE.Group();
    // group.add(cube);
    // group.add(sphere);
    // scene.add(group);
    // scene.add(cube);
    // scene.add(new THREE.AxesHelper(2));

    // **** Custom Geometry ****
    const customGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, 0,
      0, 1, 0,
      1, 0, 0,
      1, 0, 0,
      0, 1, 0,
      1, 1, 0
      ]);

    customGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const customGeometryMaterial = new THREE.MeshBasicMaterial({ color: 'purple', wireframe: true });
    const customMesh = new THREE.Mesh(customGeometry, customGeometryMaterial);
    scene.add(customMesh);

    // cube.rotation.y = Math.PI / 4;
    let time = Date.now();
    const clock = new THREE.Clock();
    const tick = () => {
      let currentTime = Date.now();
      let deltaTime = (currentTime - time);
      time = currentTime;
      // group.rotation.x = clock.getElapsedTime() * Math.PI * 2;
      // cube.rotation.y = clock.getElapsedTime() * Math.PI * 2;
      // cube.rotation.z = clock.getElapsedTime() * Math.PI * 2;
      // group.position.x = Math.sin(clock.getElapsedTime() * 3) * 2;
      // group.position.y = Math.cos(clock.getElapsedTime() * 3) * 2;
      // camera.lookAt(cube.position);
      // cube.position.y += 0.001 * deltaTime;
      // cube.position.z += 0.001 * deltaTime;
      // console.log(window.innerWidth, window.innerHeight);
      // cube.position.x = (this.cursor.x / window.innerWidth) * 5 - 2.5;
      // cube.position.y = -(this.cursor.y / window.innerHeight) * 5 + 2.5;
      // cube.rotation.x = (this.cursor.y / window.innerHeight) * Math.PI * 2 - (Math.PI);
      // cube.rotation.y = (this.cursor.x / window.innerWidth) * Math.PI * 2 - (Math.PI);
      // camera.position.x = (this.cursor.x / window.innerWidth) * 5 - 2.5;
      // camera.position.y = -(this.cursor.y / window.innerHeight) * 5 + 2.5;
      // camera.lookAt(cube.position);
      // camera.position.x = Math.sin(this.cursor.x * Math.PI * 2) * 5;
      // camera.position.y = Math.sin(this.cursor.y * Math.PI * 2) * 5;
      // camera.position.z = Math.cos(this.cursor.y * Math.PI * 2) * 5;
      // camera.lookAt(cube.position);
      // this.renderer.render(scene, this.camera);
      // console.log(cube.rotation.x);
      // console.log(clock.getElapsedTime());
      // console.log(clock.getDelta());
      // console.log(deltaTime);
      orbitControls.update();
      this.renderer.render(scene, this.camera);
      // console.log(cursor);
      requestAnimationFrame(tick);
    }

    

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas().nativeElement });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(scene, this.camera);

    tick();
  }

  ngOnDestroy(): void {
    this.geometry1?.dispose();
    this.geometry2?.dispose();
    this.material?.dispose();
    this.renderer?.dispose();
  }
}
