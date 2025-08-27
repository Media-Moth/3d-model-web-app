import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
const controls = new OrbitControls( camera, renderer.domElement );

renderer.setSize( window.innerWidth / 1.5, window.innerHeight / 1.5);
renderer.setAnimationLoop( animate );

const input = document.getElementById("input");
input.addEventListener("change", updateModelView);

var form = document.querySelector("#uploadForm");

form.addEventListener("submit", function (e) {
    e.preventDefault();
    form = document.querySelector("#uploadForm");
    var formdata = new FormData(form)

    getResizedCanvas(renderer.domElement, 1200, 800).toBlob((blob) => { // 3:2 ratio
        // send form data through POST
        formdata.append('image', blob, `${document.querySelector('#text').value}.png`)
        console.log(blob);
        fetch(window.location.href, {
            method: "POST",
            body: formdata
        })
            .then((response) => response.json())
            .then((url) => window.location = url);
    });
});
function getResizedCanvas(canvas,newWidth,newHeight) { // stolen from stack overflow
    var tmpCanvas = document.createElement('canvas');  // so every thumbnail is saved with the same size
    tmpCanvas.width = newWidth;                        // page is refreshed shortly after so there should be no memory leaks
    tmpCanvas.height = newHeight;

    var ctx = tmpCanvas.getContext('2d');
    ctx.drawImage(canvas,0,0,canvas.width,canvas.height,0,0,newWidth,newHeight);

    return tmpCanvas;
}

function updateModelView()
{
    const file = input.files[0];

    // deleting everything then remaking the light is just easier
    // doing a special loop to delete everything but the light is not working idk why
    scene.clear();
    const light = new THREE.HemisphereLight( 0xffffff, 0x080820, 1 );
    scene.add(light);

    new RGBELoader() // define rgbeloader
        .setPath( '../static/images/modelTextures' )
        .load( 'royal_esplanade_1k.hdr', function ( texture ) {

            texture.mapping = THREE.EquirectangularReflectionMapping;

            scene.background = texture;
            scene.environment = texture;

		render();
        const loader = new GLTFLoader();
        loader.load(URL.createObjectURL(file), (gltf) => {
            scene.add(gltf.scene);
        }, undefined, (error) => {
            console.error('An error happened:', error);
        });
    });
    // const material = new THREE.MeshPhongMaterial({color: 0x949494, flatShading: true, side: THREE.DoubleSide});

    // gltf.scene.traverse((child) => {
    //     if (child.isMesh) {
    //     child.material = material;
    //     }
    // });

    
}
// const loader = new GLTFLoader();
// const model = document.getElementById("model").innerText;

// loader.load(`../static/models/${model}`, (gltf) => {
//   const material = new THREE.MeshPhongMaterial({color: 0xff00ff, flatShading: true});

//   gltf.scene.traverse((child) => {
//     if (child.isMesh) {
//       child.material = material;
//     }
//   });

//   scene.add(gltf.scene);
// }, undefined, (error) => {
//   console.error('An error happened:', error);
// });

document.getElementById("3dcanvas").appendChild( renderer.domElement );
renderer.domElement.className = "centreCanvas";
renderer.domElement.classList.add("rounddown");

// const canvas = renderer.domElement;
// const imageData = canvas.toDataURL('image/png');

// document.getElementById('image').value = imageData

const geometry = new THREE.TorusKnotGeometry( 1, 0.4, 100, 16 ); 
const material = new THREE.MeshPhongMaterial({color: 0x949494, flatShading: false});
const cube = new THREE.Mesh( geometry, material );
const light = new THREE.HemisphereLight( 0xffffff, 0x080820, 1 );

scene.add(light);
scene.add(cube);


camera.position.z = 5;

function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.02;
    renderer.render( scene, camera );
}
window.addEventListener('resize', function() {
    renderer.setSize( window.innerWidth / 1.5, window.innerHeight / 1.5);
});