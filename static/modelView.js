import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var url = window.location;
url = url.pathname.slice(7)
console.log(url); // prints model id

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );

renderer.setSize( window.innerWidth / 1.5, window.innerHeight / 1.5);
renderer.setAnimationLoop( animate );

const loader = new GLTFLoader();
const model = document.getElementById("model").innerText;

loader.load(`../static/models/${model}`, (gltf) => {
  const material = new THREE.MeshPhongMaterial({color: 0x949494, flatShading: true, side: THREE.DoubleSide});

  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.material = material;
    }
  });

  scene.add(gltf.scene);
}, undefined, (error) => {
  console.error('An error happened:', error);
});

document.getElementById("3dcanvas").appendChild( renderer.domElement );
renderer.domElement.className = "centreCanvas";
renderer.domElement.classList.add("rounddown");

const light = new THREE.HemisphereLight( 0xffffff, 0x080820, 1 );

scene.add(light);

camera.position.z = 5;

function animate() {
    renderer.render( scene, camera );

}
window.addEventListener('resize', function() {
    renderer.setSize( window.innerWidth / 1.5, window.innerHeight / 1.5);
});