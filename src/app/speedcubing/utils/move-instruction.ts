import {Direction, SidePosition} from './enums';

export interface MoveInstruction {
  start_with: SidePosition;
  end_with?: SidePosition;
  direction: Direction;
  moves?: { from: SidePosition, to: SidePosition }[];
}
