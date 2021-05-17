import {BoxGeometry, Mesh, MeshBasicMaterial, Vector3} from 'three';

type CubeMeshProps = {
  position: Vector3;
  materials: MeshBasicMaterial[];
};

export default class CubeMesh extends Mesh {

  position: { x: number, y: number, z: number };

  constructor({position, materials}: CubeMeshProps) {
    super(new BoxGeometry(1, 1, 1), materials);
    this.position.x = position.x;
    this.position.y = position.y;
    this.position.z = position.z;
  }
}
