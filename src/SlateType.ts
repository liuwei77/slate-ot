import { Operation, Transforms, Element, createEditor, Editor } from 'slate';
import { OT } from './OT';

const slateType = {
  name: 'slate-ot-type',

  uri: 'http://sharejs.org/types/slate-ot-type',

  create(init: Element): Editor {
    const e = createEditor();
    e.children = init.children;
    return <Editor>init;
  },

  apply(snapshot: Editor, op: Operation[] | Operation) {
    slateType.normalize(op).forEach((o) => {
      Transforms.transform(snapshot, o);
    });
    return snapshot;
  },

  transform(
    op1: Operation[] | Operation,
    op0: Operation[],
    side: 'left' | 'right'
  ) {
    let result: Operation[] = [];
    op1 = slateType.normalize(op1);

    for (let i = 0; i < op1.length; i++) {
      let leftOp = op1[i];

      for (let j = 0; j < op0.length; j++) {
        const rightOp = op0[j];
        leftOp = doTransform(leftOp, rightOp, side);

        // if (Array.isArray(leftOp) && leftOp.length > 1) {
        //   leftOp = slateType.transform(leftOp, op0.slice(j), side);
        //   break;
        // }
      }
      result = Array.isArray(leftOp)
        ? [...result, ...leftOp]
        : [...result, leftOp];
    }
    return result;
  },

  serialize(snapshot) {
    return JSON.stringify(snapshot);
  },

  // deserialize(data) {
  //   // return Value.fromJSON(data);
  // },

  normalize(op: Operation | Operation[]): Operation[] {
    return Array.isArray(op) ? op : [op];
  },
};

const doTransform = (
  leftOp: Operation,
  rightOp: Operation,
  side: 'left' | 'right'
) => {
  // return side === 'left' ? leftOp : rightOp;
  switch (leftOp.type) {
    case 'insert_text':
      return OT.transInsertText(leftOp, rightOp, side);
    case 'remove_text':
      return OT.transRemoveText(leftOp, rightOp, side);
    case 'insert_node':
      return OT.transInsertNode(leftOp, rightOp, side);
    default:
      throw new Error('Unsupported OP');
  }
};

export { slateType };
