import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'; //import threejs
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {Howl, Howler} from 'howler';
const backgroundSoundArray=[];
const otherSoundsMap=new Map();
export const Gltf=async(url)=>{
    const loader = new GLTFLoader();
    const Gltf = await loader.loadAsync(url);
    return Gltf;
}
export const LoadTexture=(url,callBack)=>{
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, (texture)=>{
        const material = new THREE.SpriteMaterial({ map: texture });
        callBack(material);
    });
}
//load this sound just one
export const playBackGroundSound=()=>{
    const sound = new Howl({
            src: ['./assets/jungle.mp3'],
            autoplay: true,
            loop: true,
            volume: 1,
        });
        backgroundSoundArray.push(sound)
}
function getFileName(filePath)
{
    const slashIndex = filePath.lastIndexOf("/") + 1;
    const dotIndex = filePath.lastIndexOf(".");
    return filePath.substring(slashIndex, dotIndex);
}
export const loadOtherSounds=()=>{
    const otherSounds=['./assets/diesuccess.mp3','./assets/hitsound.mp3','./assets/gunsound.mp3'];
    for(let i=0;i<otherSounds.length;i++)
    {
        const soundName=otherSounds[i];
        const sound = new Howl({
            src: [soundName],
            autoplay: false,
            loop: false,
            volume: 1
        });
        if(soundName===`./assets/gunsound.mp3`)
        {
            sound.volume(0.1);
        }
        sound.once('load', function(){
            otherSoundsMap.set(getFileName(otherSounds[i]),sound);
        });
      
    }
}
export const PlayNormalSound=(name)=>{
    const sound=otherSoundsMap.get(name);
    
    if(sound)
    {
        sound.play();
    }
    
}