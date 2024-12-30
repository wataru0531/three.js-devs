/**************************************************************

shinさん

https://www.youtube.com/watch?v=bdQf9vlfxdI&t=69s

***************************************************************/
import "./style.css";
import * as THREE from "three";
// FlyControls ... マウスコントロール
import { FlyControls } from "three/examples/jsm/controls/FlyControls.js";
// 
import { Lensflare, LensflareElement } from "three/examples/jsm/objects/Lensflare.js";


let camera, scene, renderer;
let controls;

init();
async function init(){

  // camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    15000,
  );
  camera.position.z = 250;

  // scene
  const scene = new THREE.Scene();

  // geometry 
  const size = 250;
  const geometry = new THREE.BoxGeometry(size, size, size);

  // material
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff, //鏡面反射
    shininess: 50,      //輝度
  });

  for(let i = 0; i < 1000; i++){
    // mesh化
    const mesh = new THREE.Mesh(geometry, material);

    // -1 〜　1 の範囲にランダムに配置
    mesh.position.x = 8000 * (2.0 * Math.random() - 1.0);
    mesh.position.y = 8000 * (2.0 * Math.random() - 1.0);
    mesh.position.z = 8000 * (2.0 * Math.random() - 1.0);

    // ランダムに回転させる
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.rotation.z = Math.random() * Math.PI;

    scene.add(mesh);
  }

  // 平行光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.03);
  scene.add(directionalLight);

  // テキスチャを読み込む関数
  function texLoader(url){
    const  textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(url);

    return texture;
  }

  // ポイント光源 
  // hsl...h 色相、s 彩度、l 輝度。
  function addLight(h, s, l, x, y, z){
    const light = new THREE.PointLight(0xffffff, 1.5, 2000);
    light.color.setHSL(h, s, l);
    light.position.set(x, y, z);

    scene.add(light);

    // レンズフレアを追加
    const textureFlare = texLoader("./textures/LensFlare.png");

    const lensfrare = new Lensflare();
    lensfrare.addElement(
    new LensflareElement(textureFlare, 700, 0, light.color)
    );
    scene.add(lensfrare)
  }
  addLight(0.08, 0.3, 0.9, 0, 0, -1000);

  //  ヘルパー
  const axesHelper = new THREE.AxesHelper(50);
  scene.add(axesHelper);

  // renderer
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding; // レンズフレアが明るくなる
  document.body.appendChild(renderer.domElement);

  // マウス操作
  controls = new FlyControls(camera, renderer.domElement);
  // controls.movementSpeed = 2500; // 
  controls.rollSpeed = Math.PI / 20; // カーソルの追従を速くする

  const clock = new THREE.Clock();

  // アニメート関数
  animate();
  function animate(){
    requestAnimationFrame(animate);
  
    // 経過時間を取得
    const delta = clock.getDelta();
    // console.log(delta)
  
    // controlsにデルタタイムを入れることで毎時間アップデートしてマウス操作ができるようになる
    controls.update(delta)
  
    // レンダリング
    renderer.render(scene, camera);
  }
}

