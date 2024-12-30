import './style.css'

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";
import Stats from "stats-js";


init();
async function init(){
  // サイズ
  const sizes = {
    width:  window.innerWidth,
    height: window.innerHeight
  }

  // scene
  const scene = new THREE.Scene();

  // カメラ
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    1000,
  );
  camera.position.z = 400;

  // レンダラー
  const canvas = document.getElementById("canvas");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true; // 影を作る

  // ランダムな数値を取得する関数
  function mapRand(min, max, isInt = false) {
  // 例　1から5までの数が欲しい時
  // let rand = 0.9333.... * ( 5 -　1 ) + 1;
  let rand = Math.random() * ( max - min ) + min;
  rand = isInt ? Math.round(rand) : rand; // round ... 四捨五入

  return rand;
  }


  // メッシュの数など...
  const X_NUM = 10;
  const Y_NUM = 6;
  const SCALE = 30;
  const COLORS = {
    MAIN: "#f3f4f6", // グレー
    SUB: "#60a5fa",  // ブルー
  };

  const boxGeo   = new THREE.BoxGeometry(SCALE, SCALE, SCALE);
  const mainMate = new THREE.MeshLambertMaterial({ color: COLORS.MAIN }); 
  const subMate  = new THREE.MeshLambertMaterial({ color: COLORS.SUB });

  const boxes = [];

  // 縦軸(Y軸) yの1回目のループに関してxのループが10回繰り返される。それが6回繰り返し
  for(let y = 0; y <= Y_NUM; y++){
    // 横軸(X軸)
    for(let x = 0; x <= X_NUM; x++){
      const material = Math.random() < .2 ? subMate : mainMate;

      const box = new THREE.Mesh(boxGeo, material);

      // メッシュ毎に30ずつずらしていく
      box.position.x = x * SCALE - (X_NUM * SCALE / 2); // 全ての長さの大きさの半分を引いて中央寄せ
      box.position.y = y * SCALE - (Y_NUM * SCALE / 2);
      box.position.z = mapRand(-10, 10);

      box.scale.set(0.98, 0.98, 0.98); // 少し小さくして隙間を作る

      box.castShadow = true;     // 影を付けたい物体のcastShadowをtrueに
      box.receiveShadow = true;  // 影を受けたい物体のreceiveShadowをtrueに

      boxes.push(box);
    }
  }
  scene.add(...boxes);


  // ライト
  const amLight = new THREE.AmbientLight(0x3f3f46);

  const pLight = new THREE.PointLight(0xffffff, 1, 200);
  pLight.position.set(-26, 7, 100);
  pLight.castShadow = true;  // 影をつけたいライトのcastShadowをtrueに
  pLight.shadow.mapSize.width = 1024;  // 影を滑らかに
  pLight.shadow.mapSize.height = 1024;

  const dLight = new THREE.DirectionalLight(0xaabbff, 0.6);
  dLight.position.set(0, 0, 70);

  scene.add(
    amLight,
    pLight,
    dLight,
  );

  // ヘルパー
  const axes = new THREE.AxesHelper(100);
  const pLightHelper = new THREE.PointLightHelper(pLight, 10);
  const dLightHelper = new THREE.DirectionalLightHelper(dLight, 10);

  scene.add(
    axes,
    pLightHelper,
    dLightHelper,
  );

  // OrbitControls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  /**************************************************************
  パフォーマンス測定 Stats-js
  ***************************************************************/
  const stats = new Stats();

  // 0...FPS 1...mx 2...mb 3...custom
  // FPSは60に近ければパフォーマンスが良い
  stats.showPanel(0); 
  document.body.appendChild(stats.dom);


  // レンダー
  render();
  function render(){
    stats.begin();  // stats-jsの始まり


    requestAnimationFrame(render);

    controls.update(); // enableDampingをtrueにした場合は必須
    renderer.render(scene, camera);


    stats.end(); // stats-jsの終わり
  }

  // リサイズ
  window.addEventListener("resize", () => {
    sizes.width  = window.innerWidth,
    sizes.height = window.innerHeight,

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
  })

  /**************************************************************
  GUI
  ***************************************************************/
  const gui = new GUI();
  // gui.add(pLight.position, "x", -500, 500, 1);

  // ポイントライト
  const folder1 =  gui.addFolder("PointLight");
  folder1.close();
  folder1.add(pLight.position, "x", -500, 500, 1);
  folder1.add(pLight.position, "y", -500, 500, 1);
  folder1.add(pLight.position, "z", -500, 500, 1);

  // ディレクションライト
  const folder2 = gui.addFolder("DirectionalLight");
  folder2.close();
  folder2.add(dLight.position, "x", -500, 500, 1);
  folder2.add(dLight.position, "y", -500, 500, 1);
  folder2.add(dLight.position, "z", -500, 500, 1);

  // メインカラー addColorを使う
  const folder3 = gui.addFolder("MainColor");
  // folder3.close();
  folder3.addColor(COLORS, "MAIN").onChange(() => { 
    mainMate.color.set(COLORS.MAIN);
  })

  // サブカラー
  const folder4 = gui.addFolder("SubColor");
  // folder4.close();
  folder4.addColor(COLORS, "SUB").onChange(() => {
    subMate.color.set(COLORS.SUB);
  });

  


}
