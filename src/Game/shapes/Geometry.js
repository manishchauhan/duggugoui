import * as THREE from 'three'; //import threejs
//Get a Box Geometry
export const BoxGeometryRef=({__width,__height,__depth, __color})=>{
    const geometry = new THREE.BoxGeometry( __width, __height, __depth );
    const material = new THREE.MeshBasicMaterial( { color: __color } );
    const cube = new THREE.Mesh( geometry, material );
    return cube;
}
// Function to get the width of an object
export function getWidthOfObject(object) {
    var boundingBox = new THREE.Box3().setFromObject(object);
    return boundingBox.max.x - boundingBox.min.x;
}
export function getObjectSize(object)
{
  
  // Calculate the bounding box of the object
  const box = new THREE.Box3().setFromObject(object);
  // Extract the dimensions of the bounding box
  const objectHeight = box.getSize(new THREE.Vector3()).y;
  const objectWidth = box.getSize(new THREE.Vector3()).x;
  return {width:objectWidth,height:objectHeight}
  
}
export function getMaxMinXposition(modelWidth)
{
    const screenWidth = window.innerWidth;
    return {xMin:0,xMax:screenWidth }
}
//fisherYatesShuffle random
export function fisherYatesShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  
  export function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
  //ObjectPool pool any type of object
  export class ObjectPool
  {
     constructor()
     {
        this.Pool=[];
     }
     addToPool(object)
     {
      this.Pool.push(object);
     }
     getFromPool()
     { 
         if(this.Pool.length)
         {
          return this.Pool.pop();
         }
        return undefined;
     }
  }
  export function checkCollision(objectModelA,objectModelB) {

    objectModelA.userData.obb.copy(objectModelA.geometry.userData.obb)
    objectModelB.userData.obb.copy(objectModelB.geometry.userData.obb)
    objectModelA.userData.obb.applyMatrix4(objectModelA.matrixWorld)
   objectModelB.userData.obb.applyMatrix4(objectModelB.matrixWorld)

   if (objectModelA.userData.obb.intersectsOBB(objectModelB.userData.obb)) {
      return true;
   } 
    return false;
  }
  export function calculateVisibleAreas(camera) {
    const fov = camera.fov;
    const aspect = camera.aspect;
    const near = camera.near;
    const far = camera.far;
  
    const halfFOV = THREE.MathUtils.degToRad(fov) / 2;
    const maxVisibleArea = Math.tan(halfFOV) * near;
    const minVisibleArea = Math.tan(halfFOV) * far;
  
    return {
      maxVisibleArea: maxVisibleArea,
      minVisibleArea: minVisibleArea
    };
  }