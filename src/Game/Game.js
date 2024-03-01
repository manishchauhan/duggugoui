import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'; //import threejs
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { calculateVisibleAreas, checkCollision, ObjectPool, getRandomFloat, getRandomInt, getObjectSize, fisherYatesShuffle } from './shapes/Geometry';
import { LoadTexture, Gltf, playBackGroundSound, loadOtherSounds, PlayNormalSound } from './shapes/Graphic';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { OBB } from 'three/addons/math/OBB.js';
import TWEEN, { add } from '@tweenjs/tween.js'
import { userGameData } from './scoreBoard'

const Game = ({ callBack }) => {

  // Create a raycaster
  let gameLevel = 2;
  let heartMaterial;
  const bulletArray = [];
  const mouse = new THREE.Vector2();
  let gunModel = undefined;
  const deerStateChangeTime = 4000;
  const gameRef = useRef(null);
  let modelArray = [];
  let __gltfDeer;
  const deerAction = {
    idle: 0,
    run: 2,
    walk: 3
  }
  //  //0 static 1 die 2 run 3 walk
  const deerRandomAction = [deerAction.run, deerAction.walk, deerAction.walk, deerAction.run, deerAction.run];

  const clock = new THREE.Clock();
  useEffect(() => {
    const bulletObjectPool = new ObjectPool();
    //scene
    const scene = new THREE.Scene();
    let sceneColor = 0x87CEEB;
    if (gameLevel === 2 ||gameLevel===3) {
      sceneColor = 0x000000;
    }
    scene.background = new THREE.Color(sceneColor);
    scene.fog = new THREE.Fog(sceneColor, 500, 1000);
    //camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Set up the OrbitControls
    //webgl render
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    gameRef.current.appendChild(renderer.domElement);
    //const controls = new OrbitControls( camera, renderer.domElement );
    //light
    let skyColor = 0x87ceeb; // Light blue color for the sky
    let groundColor = 0xd2b48c; // Light brown color for the ground
    let intensity = 1;
    if (gameLevel === 2 || gameLevel===3) {
      // Custom light colors for the HemisphereLight
      skyColor = 0x87ceeb; // Light blue color for the sky
      groundColor = 0xd2b48c; // Light brown color for the ground
      intensity = 0.5; // Reduce the intensity for a subtle ambient light effect
    }

    const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1); // Position the light to represent the sun direction
    scene.add(directionalLight);
    //add sun
    // Add stars to the night sky
    function addStarsToSky() {
      const starGeometry = new THREE.BufferGeometry();
      const starMaterial = new THREE.PointsMaterial({
          size: 0.1,
          sizeAttenuation: true,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
      });
  
      const starsVertices = [];
      const numStars = 200; //
      for (let i = 0; i < numStars; i++) {
          const x = (Math.random() - 0.5) * 200;
          const y = (Math.random() - 0.5) * 200;
          const z = (Math.random() - 0.5) * 200;
          starsVertices.push(x, y, z);
      }
  
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
    }
    if(gameLevel===2 || gameLevel===3)
    {
      addStarsToSky();
    }
   
    playBackGroundSound(); //load bg sounds
    loadOtherSounds() //load other sounds
    const addFloor = () => {
      // Create a material with the custom fragment shader
      const material = new THREE.MeshLambertMaterial({ color: 0x00D100, transparent: true, opacity: 0.75 }); // Green color (change to your desired shade)

      const floorWidth = window.innerWidth * 3;
      let geometry = new THREE.PlaneBufferGeometry(floorWidth, floorWidth);
      const floorMesh = new THREE.Mesh(geometry, material);
      floorMesh.position.set(0, -150, 0);
      floorMesh.rotation.x = -Math.PI * 0.43;
      scene.add(floorMesh);
    };
    addFloor();

    // Add orbit controls for mouse rotation
    //camera

    camera.position.z = 5;

    Gltf('./assets/deer/scene.gltf').then((gltf) => {
      __gltfDeer = gltf;
      // Clone the model using SkeletonUtils
      switch (gameLevel) {
        case 1:
          addClonesDeer();
          setInterval(() => {
            for (let i = 0; i < modelArray.length; i++) {
              const deerModel = modelArray[i];
              if (!deerModel.isDead) {
                swapDeerState(deerModel, deerModel.clonedMixture);
              }
            }
          }, deerStateChangeTime)
          break;
        case 2:
          addZigZagDeers();
      }
      animate();
    })
    //add gun
    Gltf('./assets/stg.58/scene.gltf').then((gltf) => {
      addGun(gltf);
      createBulletsPool();
      addKeyAndMouseEvents();
      loadAllSprites();
    })
    //load Tree
    Gltf('./assets/stylized_tree/scene.gltf').then((gltf) => {
      if (gameLevel === 1) {
        addTreeAtFirstLevel(gltf);
      } else if (gameLevel === 2) {
        addTreeAtFirstLevel(gltf);
      }
    })
    function addTreeAtFirstLevel(gltf) {
      const treeMode = gltf.scene;
      //add 7 trees
      const max_tree = 20;
      const treeScaleFactor = 20;
      for (let i = 0; i < max_tree; i++) {
        const cloneTree = treeMode.clone();
        cloneTree.scale.set(treeScaleFactor, treeScaleFactor, treeScaleFactor);
        cloneTree.position.x = Math.random() * 50 - 25;
        cloneTree.position.z = -15;
        scene.add(cloneTree);
      }
    }
    function loadAllSprites() {
      LoadTexture('./assets/heart.png', (material) => {
        heartMaterial = material;
      })
    }
    function addKeyAndMouseEvents() {
      //add mouse events
      renderer.domElement.addEventListener('mousedown', mouseDown);
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('mouseup', mouseUp);
      //add key events
      document.addEventListener('keyup', function (event) {
        if (event.code === 'Space') {
          fireBullet();
        }
      });
    }
    function createBulletsPool() {
      const radius = 0.05;
      const widthSegments = 4;
      const heightSegments = 4;
      const maxBullets = 15;
      const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments)
      sphereGeometry.computeBoundingBox();
      const mainBulletObject = new THREE.Mesh(sphereGeometry, new THREE.MeshBasicMaterial({ color: 0xFF0000, transparent: true, opacity: 1 }));
      mainBulletObject.position.set(0, 0, 0)
      for (let i = 0; i < maxBullets; i++) {
        const bulletObject = mainBulletObject.clone();
        bulletObject.visible = false;
        bulletObject.isActive = false;
        bulletObject.geometry.userData.obb = new OBB().fromBox3(
          bulletObject.geometry.boundingBox
        )
        bulletObject.userData.obb = new OBB();
        scene.add(bulletObject);

        bulletObjectPool.addToPool(bulletObject);
      }

    }

    function removeObject(object) {
      // Option 1: Using the parent object's remove() method
      scene.remove(object);

      // Option 2: Using the mesh's dispose() method
      if (object.geometry) {
        object.geometry.dispose();
        object.material.dispose();
      }

      // Clean up other references to the cube
      object = null;
    }
    function fireBullet() {
      if (gunModel.isDraging) {
        const bulletObject = bulletObjectPool.getFromPool();
        const rotation = gunModel.rotation;
        // Calculate the direction vector based on the rotation angles
        const direction = new THREE.Vector3(-1, 0.3, 0); // Default direction
        direction.applyEuler(rotation);
        bulletObject.position.copy(gunModel.position);
        bulletObject.visible = true;
        bulletObject.isActive = true;
        if (bulletObject.visible) {
          const bulletSpeed = 0.5;
          bulletObject.velocity = direction.multiplyScalar(bulletSpeed);
          bulletArray.push(bulletObject);
        }
        PlayNormalSound("gunsound");
      }

    }
    function addGun(gltf) {
      gunModel = gltf.scene;
      gunModel.scale.set(1.5, 1.5, 1.5);
      gunModel.position.set(0, -1, 3);
      gunModel.rotation.y = -Math.PI / 2;
      gunModel.isDraging = false;
      gunModel.height = getObjectSize(gunModel).height;
      scene.add(gunModel);
    }
    function onMouseMove(event) {
      if (gunModel.isDraging) {
        // Calculate the mouse coordinates normalized to the range [-1, 1]
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const rotationSpeedX = window.innerWidth / 250;
        const rotationSpeedY = 1.35;
        const deltaX = mouse.x - gunModel.userData.lastMouseX;
        const deltaY = mouse.y - gunModel.userData.lastMouseY;
        const rotationAngleX = rotationSpeedX * deltaX;
        const rotationAngleY = rotationSpeedY * deltaY;
        // Apply the rotation to the selected object
        if (!isNaN(rotationAngleX)) {
          gunModel.rotation.y -= rotationAngleX;
          gunModel.rotation.x += rotationAngleY;

        }
        gunModel.userData.lastMouseX = mouse.x;
        gunModel.userData.lastMouseY = mouse.y;
      }

    }
    //function mouseUp
    function mouseUp(event) {
      gunModel.isDraging = false;
    }
    // Define the click event handler
    function mouseDown(event) {
      gunModel.isDraging = true;
    }
    //add ZigZagDeer
    const deerRandomHorPositionArray = [];
    function getAllDeersXPosition() {
      const showMax = 9;
      for (let i = 0; i < showMax; i++) {
        const xPosition = (-window.innerWidth + (i * 250)) * 0.015;
        deerRandomHorPositionArray.push(xPosition);
      }
    }
    getAllDeersXPosition();
    function getDeerXPosition(index) {
      return deerRandomHorPositionArray[index];
    }
    function addZigZagDeer(index) {
      const model = __gltfDeer.scene;
      const clonedDeerModel = SkeletonUtils.clone(model);
      clonedDeerModel.flash = false;
      clonedDeerModel.position.x = getDeerXPosition(index);

      clonedDeerModel.position.z = -12;
      clonedDeerModel.direction = 1;
      clonedDeerModel.isDead = false;
      clonedDeerModel.life = 5;//alteast shoot five bullet
      clonedDeerModel.name = `deer` + index;
      //add body of hit area-------------------------------------------
      const bodygeometry = new THREE.BoxGeometry(0.30, 0.75, 0.75)
      bodygeometry.computeBoundingBox();
      const bodymaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0 });
      const deerBodyHitArea = new THREE.Mesh(bodygeometry, bodymaterial);
      deerBodyHitArea.position.y = 1.2;
      deerBodyHitArea.position.z = 0.5;
      deerBodyHitArea.visible = false;
      deerBodyHitArea.geometry.userData.obb = new OBB().fromBox3(
        deerBodyHitArea.geometry.boundingBox
      )
      deerBodyHitArea.userData.obb = new OBB();
      clonedDeerModel.body = deerBodyHitArea;
      clonedDeerModel.add(deerBodyHitArea);
      scene.add(clonedDeerModel)
      const deerProps = getDeerMixture(clonedDeerModel, 1);
      clonedDeerModel.clonedMixture = deerProps[0];
      const deerState = deerProps[1];
      modelArray.push(clonedDeerModel);
      switch (deerState) {
        case deerAction.run:
          clonedDeerModel.speed = fisherYatesShuffle(0.50, 2.0);
          clonedDeerModel.yspeed = clonedDeerModel.speed / 11;
          break;
        case deerAction.walk:
          clonedDeerModel.speed = fisherYatesShuffle(0.20, 0.35);
          clonedDeerModel.yspeed = clonedDeerModel.speed / 11;
          break;
      }
      clonedDeerModel.deerState = deerState;
    }
    function addZigZagDeers() {

      const maxDeer = 60;
      for (let i = 0; i < maxDeer; i++) {
        addZigZagDeer(i);
      }
    }
    //add main deer
    function getDeerMixture(clonedDeerModel, mixerSpeed = 1) {
      const clonedMixture = new THREE.AnimationMixer(clonedDeerModel);
      const deerState = fisherYatesShuffle(deerRandomAction)[0];
      const mixer = clonedMixture.clipAction(__gltfDeer.animations[deerState]).play();
      mixer.timeScale = mixerSpeed;
      return [clonedMixture, deerState];
    }
    function addClonesDeer() {

      const model = __gltfDeer.scene;

      for (let i = 0; i < 50; i++) {

        const clonedDeerModel = SkeletonUtils.clone(model);
        clonedDeerModel.position.x = getRandomFloat(1, -10);
        clonedDeerModel.position.z = getRandomFloat(2, -10);
        clonedDeerModel.rotation.y = -Math.PI / 2;
        clonedDeerModel.direction = fisherYatesShuffle([1, -1])[0]; //Get first element
        clonedDeerModel.speed = 0;
        clonedDeerModel.isDead = false;
        clonedDeerModel.life = 5;//alteast shoot five bullet
        if (clonedDeerModel.direction === 1) {
          clonedDeerModel.rotation.y = Math.PI / 2;
        } else {
          clonedDeerModel.rotation.y = -Math.PI / 2;
        }
        //add body of hit area-------------------------------------------
        const bodygeometry = new THREE.BoxGeometry(0.75, 0.75, 1)
        bodygeometry.computeBoundingBox();
        const bodymaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0 });
        const deerBodyHitArea = new THREE.Mesh(bodygeometry, bodymaterial);
        deerBodyHitArea.position.y = 0.75;
        deerBodyHitArea.rotation.y = -Math.PI / 2;
        deerBodyHitArea.geometry.userData.obb = new OBB().fromBox3(
          deerBodyHitArea.geometry.boundingBox
        )
        deerBodyHitArea.userData.obb = new OBB();
        deerBodyHitArea.visible = false;
        clonedDeerModel.body = deerBodyHitArea;
        clonedDeerModel.add(deerBodyHitArea);


        //add a obb for collision       
        scene.add(clonedDeerModel);
        const deerProps = getDeerMixture(clonedDeerModel);
        clonedDeerModel.clonedMixture = deerProps[0];
        const deerState = deerProps[1];
        modelArray.push(clonedDeerModel);
        switch (deerState) {
          case deerAction.run:
            clonedDeerModel.speed = fisherYatesShuffle(1.5, 3);
            break;
          case deerAction.walk:
            clonedDeerModel.speed = fisherYatesShuffle(0.45, 0.75);
            break;
        }

        if (clonedDeerModel.direction === 1) {
          checkMaximumXposition(clonedDeerModel);
        } else {
          checkMinimumXposition(clonedDeerModel);
        }
        //update deer state in a regular interval
        clonedDeerModel.deerState = deerState;
      }

    }
    function swapDeerState(deerModel, deerMixture) {
      const deerState = fisherYatesShuffle(deerRandomAction)[0];
      if (deerState !== deerModel.deerState) {
        deerMixture.stopAllAction();
        deerMixture.clipAction(__gltfDeer.animations[deerState]).play();
        switch (deerState) {
          case deerAction.run:
            deerModel.speed = 1.65;
            break;
          case deerAction.walk:
            deerModel.speed = 0.65;
            break;
        }
        deerModel.deerState = deerState;

      }

    }
    function isObjectInVisibleArea(Model) {
      const frustum = new THREE.Frustum()
      const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
      frustum.setFromProjectionMatrix(matrix)
      if (!frustum.containsPoint(Model.position)) {
        return false;
      }
      return true;
    }

    function checkMinimumXposition(deerModel) {

      if (!isObjectInVisibleArea(deerModel) && deerModel.direction === -1 && deerModel.position.x < 0) {

        deerModel.direction = 1;
        deerModel.rotation.y = Math.PI / 2;

      }
    }
    function checkMaximumXposition(deerModel) {
      if (!isObjectInVisibleArea(deerModel) && deerModel.direction === 1 && deerModel.position.x > 0) {
        deerModel.direction = -1;
        deerModel.rotation.y = -Math.PI / 2;
      }
    }

    function moveModelLeftRight(deerModel, delta) {
      checkMinimumXposition(deerModel);
      checkMaximumXposition(deerModel);
      deerModel.position.x += deerModel.direction * (delta * deerModel.speed);

    }
    function addBulletBackToPool(bullet) {
      bullet.visible = false;
      bullet.velocity = 0;
      bullet.isActive = false;
      bulletObjectPool.addToPool(bullet);
      const index = bulletArray.indexOf(bullet);
      // Remove the value from the array using splice()
      if (index !== -1) {
        bulletArray.splice(index, 1);
      }
    }
    function fadeDeerSoul(model) {
      const Time = 2000;
      const Distance = 0.05;
      const positionY = new TWEEN.Tween(model.position).to({ y: model.position.y + Distance }, 1000);
      positionY.start();
      const scaleDown = new TWEEN.Tween(model.scale).to({ x: 0, y: 0, z: 0 }, 500);
      scaleDown.start();
      PlayNormalSound("diesuccess");
      if (gameLevel === 2) {
        positionY.onComplete((obj) => {
          removeZigZagDeer(model);
        })
      }
    }
    function scaleModel(model) {
      const scaleUp = new TWEEN.Tween(model.scale).to({ x: 1, y: 1.45, z: 1 }, 400).easing(TWEEN.Easing.Elastic.EaseIn);;

      const scaleDown = new TWEEN.Tween(model.scale).to({ x: 1, y: 1, z: 1 }, 400).easing(TWEEN.Easing.Elastic.EaseIn);;

      scaleUp.chain(scaleDown);
      scaleUp.start();
    }
    function checkBulletAndDeerCollision(bullet) {

      modelArray.forEach((model) => {
        if (!model.isDead) {
          if (checkCollision(model.body, bullet) && bullet.isActive) {
            PlayNormalSound("hitsound");
            addBulletBackToPool(bullet);
            if (callBack) {
              userGameData.score += 1;
              callBack(userGameData);
            }
            if (model.life > 0) {
              model.life -= 1;
              scaleModel(model);
            }
            else if (model.life === 0) {
              model.clonedMixture.stopAllAction();
              let mixer = model.clonedMixture.clipAction(__gltfDeer.animations[1]);
              mixer.setLoop(THREE.LoopOnce);
              mixer.clampWhenFinished = true;
              mixer.enable = true;
              model.clonedMixture.addEventListener('finished', () => {
                fadeDeerSoul(model);
              })
              mixer.play();
              model.speed = 0;
              model.isDead = true;
              if (gameLevel === 2) {
                const showMax = 9;
                addZigZagDeer(getRandomInt(0, showMax));
              }

            }

          }
        }

      })
    }
    function checkDeerZigZagLimit(deerModel) {
      if (!isObjectInVisibleArea(deerModel)) {
        return false;
      }
      return true;
    }
    function removeZigZagDeer(deerModel) {
      deerModel.flash = true;
      const deerIndex = modelArray.indexOf(deerModel);
      deerModel.speed = 0;
      deerModel.yspeed = 0;
      deerModel.clonedMixture.stopAllAction();
      removeObject(deerModel.body)
      removeObject(deerModel);
      modelArray.splice(deerIndex, 1);
    }
    function moveTowardsMe(deerModel, delta) {

      if (!checkDeerZigZagLimit(deerModel) && !deerModel.flash) {
        removeZigZagDeer(deerModel);
        const showMax = 9;
        addZigZagDeer(getRandomInt(0, showMax));
        return true;
      }
      deerModel.position.z += deerModel.direction * (delta * deerModel.speed);
      deerModel.position.y -= deerModel.direction * (delta * deerModel.yspeed);
    }
    function animate() {
      const delta = clock.getDelta();
      modelArray.forEach((deer) => {
        if (gameLevel === 1) {
          moveModelLeftRight(deer, delta);
        }
        if (gameLevel === 2) {
          moveTowardsMe(deer, delta);
        }
        deer.clonedMixture.update(delta);
      })
      // required if controls.enableDamping or controls.autoRotate are set to true
      // controls.update();
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      TWEEN.update();
      if (bulletArray.length > 0) {
        bulletArray.forEach((bullet, index, __bulletArray) => {

          if (!isObjectInVisibleArea(bullet) || bullet.position.y > 7 || bullet.position.z < -40) {
            if (userGameData.missedBullet > 0) {
              userGameData.missedBullet -= 1;
            }
            callBack(userGameData);
            addBulletBackToPool(bullet);
          }

          if (bullet.velocity) {
            bullet.position.add(bullet.velocity)
          }
          checkBulletAndDeerCollision(bullet);//check bullet and deer collide
        })
      }
    }

  }, [])
  return (
    <div ref={gameRef}></div>
  )
}

export default Game