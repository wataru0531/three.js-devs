/**************************************************************

https://www.youtube.com/watch?v=6oFvqLfRnsU

***************************************************************/
import './style.css';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from 'gsap';


init()
async function init(){
  // シーン
  const scene = new THREE.Scene();

  // サイズ
  const sizes = {
    width:  window.innerWidth,
    height: window.innerHeight
  }

  // カメラ
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    1000
  )
  camera.position.z = 15;

  // レンダラー
  const canvas = document.getElementById("canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  })
  // console.log(renderer)

  // renderer.setClearColor("#e7e7e7")
  renderer.setClearColor("#FFFFFF")
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);

  // OrbitControls
  const control = new OrbitControls(camera, renderer.domElement);
  control.enableDamping = true; // スムーズに

  /**************************************************************
  メッシュ ランダム配置
  ***************************************************************/
  // ランダムな数値を取得する関数
  function mapRand(min, max, isInt = false){
    // 仮に、1 から 5 の数値を取得したい場合 ... 0.????... *  5 - 1  +  1 
    // 仮に、3 から 8 の数値を取得したい場合 ... 0.????... *  8 - 3  +  3
    let rand = Math.random() * (max - min) + min;

    rand = isInt ? Math.round(rand) : rand; // 整数値が欲しいなら、isIntをtrueにする
    return rand;
  };


  const meshes = [];
  const MESH_NUM  = 25;  
  const POS_RANGE = 10;   // 位置の範囲
  const MAX_SCALE = 1.5;

  // ランダムにメッシュを取得
  function randomMesh(){
    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),
      // new THREE.PlaneGeometry(1, 1),
      // new THREE.TorusGeometry(1, 0.2, 100, 100),
    ];

    const color = new THREE.Color(
      mapRand(0.7, 1),
      mapRand(0.7, 1),
      mapRand(0.7, 1)
    );
    
    const pos = {
      x: mapRand(-POS_RANGE, POS_RANGE),
      y: mapRand(-POS_RANGE, POS_RANGE),
      z: mapRand(-POS_RANGE, POS_RANGE),
    };

    const material = new THREE.MeshLambertMaterial({ color });
    // geometriesの中からランダムに取得
    const gIndex   = mapRand(0, geometries.length - 1, true);      
    const mesh     = new THREE.Mesh(geometries[gIndex], material);

    mesh.position.set(pos.x, pos.y, pos.z);
    const scale = mapRand(1, MAX_SCALE)
    mesh.geometry.scale(scale, scale, scale);
    
    return mesh;
  }

  for(let i = 0; i < MESH_NUM; i++){
    const mesh = randomMesh();
    meshes.push(mesh);
  }

  scene.add(...meshes)


  /**************************************************************
  ライト
  ***************************************************************/
  // ambientLight ... 全体に注ぐ光
  const ambientLight = new THREE.AmbientLight(0xe4e4e4, .6);

  // ライト① 0xe4e4e4
  // const light1 = new THREE.PointLight(0xe4e4e4, 1, 500);
  // light1.position.set(0, 0, 0);

  // ライト② 0xeeeeee
  const light2 = new THREE.PointLight(0xeeeeee, 0.8, 1000);
  light2.position.set(0, 0, 10);

  // ヘルパー①
  // const helper1 = new THREE.PointLightHelper(light1);
  // helper1.visible = false;

  // ヘルパー②
  const helper2 = new THREE.PointLightHelper(light2);
  helper2.visible = false;

  scene.add(
    ambientLight,
    // light1, 
    light2, 
    // helper1, 
    helper2
  );

  /**************************************************************
  正規化座標を取得
  ***************************************************************/
  const mouseCoordinates = new THREE.Vector2();   // マウス座標

  function onMouseMove (event){
    // console.log(event.clientX)
    // console.log(event);

    const element = event.currentTarget;
    // console.log(element)

    // X座標 マウスを動かした地点 - 画面の横からcanvasまでの距離
    const x = event.clientX - element.offsetLeft;
    // console.log(event.clientX, x)
    // Y座標
    const y = event.clientY - element.offsetTop;

    const canvasWidth  = element.offsetWidth;
    const canvasHeight = element.offsetHeight;

    // マウス座標を、-1 から 1　の範囲で正規化
      // スクリーン空間では上が+、下が-なのでY座標は反転させる
    mouseCoordinates.x =   ( x / canvasWidth )  * 2 - 1;
    mouseCoordinates.y = - ( y / canvasHeight ) * 2 + 1;

    // console.log(mouseCoordinates)
  }
  document.body.addEventListener("mousemove", onMouseMove);

  /**************************************************************
  ヘルパー
  ***************************************************************/
  const axes = new THREE.AxesHelper(50);
  // scene.add(axes)

  /**************************************************************
  render  +  レイキャスティング
  ***************************************************************/
  const raycaster = new THREE.Raycaster();
  // console.log(raycaster)

  render();
  function render(){
    raycaster.setFromCamera(mouseCoordinates, camera); // 光線ベクトルを生成

    const intersectsObjects = raycaster.intersectObjects(meshes); // 光線と交差したオブジェクトを格納。手前から近い順に格納
    // console.log(intersectsObjects)

    meshes.map(mesh => {
      // 交差しているオブジェクトが1つ以上存在し、交差しているオブジェクトの1番目(最前面)のものだったら
      if(intersectsObjects.length > 0 && mesh === intersectsObjects[0].object){
        // 該当オブジェクトに対する処理
        mesh.material.color.set(0xff0000)

      }else{
        // それ以外のオブジェクトに対する処理
        mesh.material.color.set(0xffffff)
      }
    })

    control.update(); // enableDumpingをtrueに
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  /**************************************************************
  リサイズ
  ***************************************************************/
  window.addEventListener("resize", () => {
    // サイズ
    sizes.width  = window.innerWidth;
    sizes.height = window.innerHeight;

    // camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // renderer
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
  })
}