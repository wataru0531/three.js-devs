
/**************************************************************

vite
初期化 npm create vite フォルダ名

***************************************************************/
/**************************************************************
CSSをHTMLに追加
***************************************************************/
const cssFile = [];
cssFile.push("./style.css");
// cssFile.push("./ここに追加していく")

for(let i = 0; i< cssFile.length; i++){
  const head = document.getElementsByTagName("head")[0];
  // console.log(head)
  const link = document.createElement("link");

  link.setAttribute("rel", "styleSheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", cssFile[i]);

  head.appendChild(link);
}

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

window.addEventListener("DOMContentLoaded", init)

async function init(){
  /*****************************************************************
  シーン
  ******************************************************************/
  const scene = new THREE.Scene();
  console.log(scene)
  /*****************************************************************
  ブラウザサイズ
  ******************************************************************/
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  /*****************************************************************
  カメラ
  ******************************************************************/
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    1000,
  );
  camera.position.set(0, 10, 200);

  scene.add(camera);

  /*****************************************************************
  レンダラー
  ******************************************************************/
  const canvas = document.getElementById('canvas');

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // antialias: true, // ギザギザがなくなる
    // alpha: true, // 背景画像が見るようにする
  });

  // renderer.setClearColor(0xf3f3f3); // 背景色変更
  // renderer.shadowMap.enabled = true; // 影をつけるための設定
  // 影をつける場合はライト、影をつける対象、影を受ける対象にもプロパティをつける。
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);

  /*****************************************************************
  ジオメトリ
  ******************************************************************/
  // const switchMedia = () => {
  //   if(window.matchMedia("(max-width: 767px)").matches){
  //     // スマホ
  
  //   }else if(window.matchMedia("(min-width: 768px)").matches){
  //     // タブレット以上
      
  //   }
  // }
  // window.onload = switchMedia;
  // window.onresize = switchMedia;
  
  const geometry = new THREE.BoxGeometry(20, 20, 20);

  /**************************************************************
  メッシュ 
  ***************************************************************/
  // マウスとの交差を調べたいメッシュを配列に格納
  const meshList = [];
  
  for(let i = 0; i < 100; i++){
    const material = new THREE.MeshStandardMaterial({color: 0xffffff});

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = (Math.random() - 0.5) * 400;
    mesh.position.y = (Math.random() -  0.5) * 400;
    mesh.position.z = (Math.random() - 0.5) * 400;
    
    // 角度はラジアン?
    mesh.rotation.x = Math.random() * 2 * Math.PI;
    mesh.rotation.y = Math.random() * 2 * Math.PI;
    mesh.rotation.z = Math.random() * 2 * Math.PI;

    scene.add(mesh);

    // 配列に保存
    meshList.push(mesh)
  }

  /*****************************************************************
  マテリアル
  ******************************************************************/
  const material = new THREE.MeshBasicMaterial({
    // envMap: cubeRenderTarget.texture,
    // reflectivity: 0.5, // 反射率
    // color: 0x00ffff,
    // wireframe: true,
  });

  /*****************************************************************
  メッシュ化
  ******************************************************************/
  // const sphere = new THREE.Mesh(geometry, material);
  // scene.add(sphere);

  /*****************************************************************
  光源 ライト
  *******************************************************************/
  // 平行光源
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // 環境光源
  const ambientLight = new THREE.AmbientLight(0x333333);
  scene.add(ambientLight);

  /*****************************************************************
  OrbitControls...カメラを動かすために使う。マウス操作
  ******************************************************************/
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.autoDamping = true;

  /*****************************************************************
  アクシスヘルパー
  *******************************************************************/
  const axes = new THREE.AxesHelper(50);
  scene.add(axes);

  /**************************************************************
  マウス座標管理用のベクトルを作成
  ***************************************************************/
  const mouseCoordinate = new THREE.Vector2();
  
  /**************************************************************
  canvasでまうすを動かした時の処理
  ***************************************************************/
  canvas.addEventListener("mousemove", handleMouseMove);

  // マウスを動かした時のイベント
  function handleMouseMove(event) {
    // console.log(event)

    // element ... canvasの情報を取得(高さ、幅など)
    const element = event.currentTarget;
    // console.log(element.offsetLeft)

    // X座標 マウスを動かした地点 - 画面の横からcanvasまでの距離
    const x = event.clientX - element.offsetLeft;
    // console.log(event.clientX, x)
    // Y座標
    const y = event.clientY - element.offsetTop;

    // canvasの幅、高さ
    const canvasWidth = element.offsetWidth;
    const canvasHeight = element.offsetHeight;

    // マウス座標を、-1 から 1　の範囲で座標を設定
    // スクリーン空間では上が+、下が-なのでY座標は反転させる
    mouseCoordinate.x = (x / canvasWidth) * 2 - 1;
    mouseCoordinate.y = - (y / canvasHeight) * 2 + 1;
  };
  console.log(mouseCoordinate)
  
  /*****************************************************************
  アニメーション
  ******************************************************************/
  // レイキャストを作成
  const raycaster = new THREE.Raycaster();

  function animate(){
    // レイキャスト ... マウス位置から画面奥方向にまっすぐに伸びる光線ベクトルを生成(見えない)
    raycaster.setFromCamera(mouseCoordinate, camera);

    // その光線とぶつかったオブジェクトを配列で取得(手前から近い順に配列に格納)
    const intersectsObjects = raycaster.intersectObjects(meshList);
    // console.log(intersectsObjects)

    meshList.map(mesh => {
      // console.log(mesh)
      // 交差しているオブジェクトが1つ以上存在し、交差しているオブジェクトの1番目(最前面)のものだったら
      if(intersectsObjects.length > 0 && mesh === intersectsObjects[0].object){
        // 赤くする
        mesh.material.color.setHex(0xff0000);
      }else{
        // それ以外は元の色にする
        mesh.material.color.setHex(0xffffff);
      }
    })

    renderer.render(scene, camera);

    // OrbitControls 特定の条件で必要(enableDamping、autoRotateを指定の時)
    controls.update();

    // フレーム更新ごとに何度も呼びだす。
    requestAnimationFrame(animate);
  };
  animate();

  /*****************************************************************
  ブラウザのリサイズ操作
  ******************************************************************/
  window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix(); // カメラに変更を加えたら必ず呼ぶ。

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
  });
};
