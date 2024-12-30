import './style.css'

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


init();
async function init() {
  // size
  const sizes = {
    width:  window.innerWidth,
    height: window.innerHeight
  }
  // scene
  const scene = new THREE.Scene();

  // camera
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    1000
  );
  camera.position.z = 75;

  // renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.getElementById("canvas")
  });
  renderer.setClearColor(0xf3f3f3);
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);

  // ランダムな数値を取得する関数
  function mapRand(min, max, isInt = false) {
    // 例　1から5までの数が欲しい時
    // let rand = 0.9333.... * ( 5 -　1 ) + 1;
    let rand = Math.random() * ( max - min ) + min;
    rand = isInt ? Math.round(rand) : rand; // 整数値で欲しい場合。inIntをtrueに

    return rand;
  }

  const meshes    = [];
  const MESH_NUM  = 50;
  const POS_RANGE = 100;
  const MAX_SCALE = 1.5;
  const TARGET_MESH_NUM = 10;

  // ランダムにメッシュを作成する関数
  function randomMesh() {
    const geometries = [
      new THREE.BoxGeometry(10, 10, 10),
      new THREE.PlaneGeometry(20, 20),
      new THREE.TorusGeometry(10, 3, 200, 20),
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

    // MeshLambert...シックな感じ    MeshBasic...テカテカな感じ
    const material = new THREE.MeshLambertMaterial({ color }); 

    // ジオメトリをランダム取得(整数値で) → メッシュ作成
    const gIndex = mapRand(0, geometries.length - 1, true);
    const mesh = new THREE.Mesh(geometries[gIndex], material);

    mesh.position.set(pos.x, pos.y, pos.z);
    const scale = mapRand(1, MAX_SCALE)
    mesh.geometry.scale(scale, scale, scale);

    return mesh;
  }

  for (let i = 0; i < MESH_NUM; i++) {
    const mesh = randomMesh();

    meshes.push(mesh);
  }

  scene.add(...meshes);

  // OrbitControls
  const control = new OrbitControls(camera, renderer.domElement);

  // ライト(初期位置は原点)
  const ambientLight = new THREE.AmbientLight(0xe4e4e4, .6);

  const light1 = new THREE.PointLight(0xe4e4e4, 1, 400);
  light1.position.set(10, 100, 110);
  
  const light2 = new THREE.PointLight(0xeeeeee, 1, 300);
  light2.position.set(-200, -100, 200);
  
  scene.add(
    ambientLight,
    light1,
    light2,
  );

  // ヘルパー
  const light1Helper = new THREE.PointLightHelper(light1, 10, 0xff0000);
  const light2Helper = new THREE.PointLightHelper(light2, 10, 0x0000ff);
  const axis = new THREE.AxesHelper(20);

  scene.add(
    light1Helper,
    light2Helper,
    axis,
  );


  /**************************************************************
  物体の移動
  ***************************************************************/
  // X軸、Y軸、X軸のいずれかにランダムに動かす値を取得する関数
  function getAction({ x, y, z }){  // x, y, zは分割代入で取得
    const rand = mapRand(0.7, 1.3);

    const ACTIONS = [
      function(){
        // xが正ならばマイナスに、負ならプラスに動く
        const direction = x > 0 ? - rand : rand;
        this.position.x += direction;
      },
      function(){
        const direction = y > 0 ? - rand : rand;
        this.position.y += direction;
      },
      function(){
        const direction = z > 0 ? - rand : rand;
        this.position.z += direction;
      }
    ];

    // ACTIONSからランダムに取得
    const action = ACTIONS[mapRand(0, ACTIONS.length - 1, true)];

    return action;
  }

  let targetMeshes = []; // 後に初期化するのでletで宣言

  // 物体をランダムに動かし、2000ms毎に物体を切り替える。
  setInterval(() => {
    // 一度meshの関数を初期化
    targetMeshes.forEach(mesh => mesh.__action = null);

    // もともとあったmeshesは削除
    targetMeshes = [];

    for(let i = 0; i < TARGET_MESH_NUM; i++){
      // const mesh = 0.5... * ( 49 - 0 ) + 0; 整数値で取得
      const mesh = meshes[mapRand(0, meshes.length - 1, true)];
      // console.log(mesh)
  
      // どの方向にどれだけ動かすかの値をランダムに取得し、関数に参照させる → render関数で実行
      mesh.__action = getAction(mesh.position);
  
      targetMeshes.push(mesh);
    }

  }, 2000);


  /**************************************************************
  render フレーム毎に発火
  ***************************************************************/
  let tick = 0;

  function render() {
    // meshをランダムに動かす
    targetMeshes.forEach(mesh => {
      mesh.__action();
    })

    // cameraを引く
    if(camera.position.z < POS_RANGE){
      camera.position.z += 0.03;
    }

    // tick += 0.001;
    // camera.position.x = 100 * Math.cos(tick)
    // camera.position.z = 100 * Math.sin(tick)

    control.update();

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  render();

  /**************************************************************
  リサイズ
  ***************************************************************/
  window.addEventListener("resize", () => {
    sizes.width  = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
  })
}
