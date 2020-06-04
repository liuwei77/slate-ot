import { InsertNodeOperation, Operation, Path } from 'slate';

export const transInsertNode = (
  leftOp: InsertNodeOperation,
  rightOp: Operation,
  side: 'left' | 'right'
): InsertNodeOperation | null => {
  switch (rightOp.type) {
    case 'insert_text': {
      return leftOp;
    }

    case 'remove_text': {
      return leftOp;
    }

    case 'insert_node': {
      if (Path.equals(leftOp.path, rightOp.path) && side === 'left') {
        return leftOp;
      }
      return {
        ...leftOp,
        path: <Path>Path.transform(leftOp.path, rightOp),
      };
    }

    case 'remove_node': {
      const path: Path | null = Path.transform(leftOp.path, rightOp);
      return path
        ? {
            ...leftOp,
            path,
          }
        : null;
    }

    default:
      throw new Error('Unsupported OP');
  }
};
