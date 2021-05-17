import * as THREE from 'three';

/* eslint-disable no-unused-vars */
export enum Axis {
  x = 'x',
  y = 'y',
  z = 'z',
}

const classicMaterials = [
  new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('../../../../assets/rubiks-cube/materials/classic/textures/blue.png')}),
  new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('../../../../assets/rubiks-cube/materials/classic/textures/green.png')}),
  new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('../../../../assets/rubiks-cube/materials/classic/textures/orange.png')}),
  new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('../../../../assets/rubiks-cube/materials/classic/textures/red.png')}),
  new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('../../../../assets/rubiks-cube/materials/classic/textures/white.png')}),
  new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('../../../../assets/rubiks-cube/materials/classic/textures/yellow.png')})
];

export {classicMaterials};
