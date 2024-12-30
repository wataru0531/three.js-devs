/**************************************************************

https://www.youtube.com/watch?v=6oFvqLfRnsU

***************************************************************/
import './style.css';
import * as THREE from "three";
import { gsap } from 'gsap';

/**************************************************************
シーン
***************************************************************/
const scene = new THREE.Scene();

/**************************************************************
カメラ
***************************************************************/
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = 10;

/**************************************************************
レンダラー
***************************************************************/
const renderer = new THREE.WebGLRenderer({
  antialias: true,
})
// console.log(renderer)

renderer.setClearColor("#e5e5e5");
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement)

/**************************************************************
メッシュ 複数をランダム配置
***************************************************************/
const geometry = new THREE.BoxGeometry(1, 1, 1);
// const geometry = new THREE.SphereGeometry(1, 10, 10);
const material = new THREE.MeshLambertMaterial({ color: 0xFFCC00 });
const mesh     = new THREE.Mesh(geometry, material);

let meshX = -10;
for(let i = 0; i < 15; i++){
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.x = ( Math.random() - 0.5 ) * 10;
  mesh.position.y = ( Math.random() - 0.5 ) * 10;
  mesh.position.z = ( Math.random() - 0.5 ) * 10;

  scene.add(mesh);
  meshX += 1;
}

scene.add(mesh);

/**************************************************************
ライト
***************************************************************/
// ライト①
const light1 = new THREE.PointLight(0xFFFFFF, 1, 500);
light1.position.set(0, 0, 0);
scene.add(light1);

// ライト②
const light2 = new THREE.PointLight(0xFFFFFF, 2, 10000);
light2.position.set(0, 0, 25);
scene.add(light2)

/**************************************************************
animate
***************************************************************/
render();
function render(){
  requestAnimationFrame(render);


  renderer.render(scene, camera);
}

/**************************************************************
レイキャスティング
***************************************************************/
const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();

function onMouseMove (event){
  event.preventDefault();
  // console.log(event.clientX)
  console.log(event.clientY);
  

  // マウス座標を、-1から1の範囲で設定
  // スクリーン空間では上が+、下が-なのでY座標は反転させる
  mouse.x =   ( event.clientX / window.innerWidth )  * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  // マウス位置から画面奥方向にまっすぐに伸びる光線ベクトルを生成(見えない)
  raycaster.setFromCamera(mouse, camera);

  // その光線とぶつかったオブジェクトを配列で取得(手前から近い順に配列に格納)
  const intersects = raycaster.intersectObjects(scene.children, true);
  console.log(intersects)
  // console.log(scene)

  for(let i = 0; i < intersects.length; i++){
    // intersects[i].object.material.color.set(0xffffff)

    // gsapとの連携させる
    const tl = gsap.timeline();

    tl.to(intersects[i].object.scale,  1, { x:  2, ease: "power4.out" });
    tl.to(intersects[i].object.scale, .5, { x: .5, ease: "power4.out" });
    tl.to(intersects[i].object.position, .5, { x: 2, ease: "power4.out" });
    tl.to(intersects[i].object.position, .5, { y: Math.PI * .5, ease: "power4.out" });
  }

}


document.body.addEventListener("mousemove", onMouseMove);

/**************************************************************
ヘルパー
***************************************************************/
const axes = new THREE.AxesHelper(50);
scene.add(axes)

/**************************************************************
リサイズ
***************************************************************/
window.addEventListener("resize", () => {

  // camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // renderer
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
})



