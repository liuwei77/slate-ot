import {
  RemoveNodeOperation,
  Operation,
  Path,
  SplitNodeOperation,
} from 'slate';

import { xTransformMxN } from './SlateType';
import { decomposeMove } from './transMoveNode';

export const transRemoveNode = (
  leftOp: RemoveNodeOperation,
  rightOp: Operation,
  side: 'left' | 'right'
): (RemoveNodeOperation | SplitNodeOperation)[] => {
  switch (rightOp.type) {
    case 'insert_node': {
      return [
        {
          ...leftOp,
          path: Path.transform(leftOp.path, rightOp)!,
        },
      ];
    }

    case 'remove_node': {
      const path: Path | null = Path.transform(leftOp.path, rightOp);
      return path
        ? [
            {
              ...leftOp,
              path,
            },
          ]
        : [];
    }

    case 'split_node': {
      if (!Path.equals(leftOp.path, rightOp.path)) {
        return [
          {
            ...leftOp,
            path: Path.transform(leftOp.path, rightOp)!,
          },
        ];
      }

      // should remove the target node && the split node
      //   however, after removing the target node,
      //   the split node becomes the same path.
      // TODO: node within op should be split.
      return [leftOp, leftOp];
    }

    case 'merge_node': {
      // One of the to-merge nodes are removed, we have to discard merging.
      // It might be better to keep the unremoved node,
      //   but it is tricky to keep properties by merge-and-split,
      //   therefore we choose to remove the entired merged node
      if (
        Path.equals(leftOp.path, Path.previous(rightOp.path)) ||
        Path.equals(leftOp.path, rightOp.path)
      ) {
        return [
          {
            ...leftOp,
            path: Path.previous(rightOp.path),
          },
        ];
      }

      return [
        {
          ...leftOp,
          path: Path.transform(leftOp.path, rightOp)!,
        },
      ];
    }

    case 'move_node': {
      if (Path.equals(rightOp.path, rightOp.newPath)) {
        return [leftOp];
      }

      let [rr, ri] = decomposeMove(rightOp);
      let [l, r] = xTransformMxN([leftOp], [rr, ri], side);

      // leftOp removes a node within the moved zone
      // ri must have survived and not been changed
      // we use ri's path to compute the true path to remove
      if (l.length === 0) {
        return [
          {
            ...leftOp,
            path: ri.path.concat(leftOp.path.slice(rr.path.length)),
          },
        ];
      }

      // now we have l.length === 1
      // in most cases we can return, but to be consist with move-remove
      // we need to handle the case that rightOp moved a branch out
      if (r.length === 1 && r[0].type === 'insert_node') {
        l = [
          ...l,
          {
            type: 'remove_node',
            path: r[0].path,
            node: { text: '' },
          },
        ];
      }

      return <RemoveNodeOperation[]>l;
    }

    // insert_text
    // remove_text
    // set_node
    default:
      return [leftOp];
  }
};
