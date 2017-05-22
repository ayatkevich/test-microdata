// @flow

type Element =
  | {
      type: string,
      props: {[string]: ?any},
      children: ?(Element[]),
    }
  | string;

type IsScope = ?boolean;
type IsProp = ?string;
type Scope = {itemScope: IsScope};
type Prop = {itemProp: IsProp};

const lookup = (prop: string) => <T>(props: {[string]: ?T}): ?T => {
  for (const name of [prop, prop.toLowerCase()]) {
    const value = props[name];
    if (typeof value === 'undefined') {
      continue;
    }
    return value;
  }
};

const lookupScope: (_: Scope) => IsScope = lookup('itemScope');
const lookupProp: (_: Prop) => IsProp = lookup('itemProp');

const traverseScalars = (elements: ?(Element[]), acc: any[]): any[] => {
  for (const element of elements || []) {
    if (typeof element !== 'object') {
      acc.push(element);
    } else {
      traverseScalars(element.children, acc);
    }
  }
  return acc;
};

const traverseProps = (elements: ?(Element[]), acc: {}): {} => {
  for (const element of elements || []) {
    if (typeof element === 'string') {
      continue;
    }
    const prop = lookupProp(element.props);
    if (prop) {
      let value;
      if (lookupScope(element.props)) {
        value = traverseProps(element.children, {});
      } else {
        switch (element.type) {
          case 'link':
            value = element.props.href;
            break;

          case 'meta':
            value = element.props.content;
            break;

          case 'iframe':
            value = element.props.src;
            break;

          default:
            value = traverseItems(element, []);
            if (!value.length) {
              value = traverseScalars(element.children, []).join(' ');
            }
        }
      }
      acc[prop] = value;
    } else {
      traverseProps(element.children, acc);
    }
  }
  return acc;
};

const traverseItems = (root: Element, acc: {}[]): {}[] => {
  if (typeof root === 'string') {
    return acc;
  }

  if (lookupScope(root.props)) {
    const newItem = {};
    traverseProps(root.children, newItem);
    acc.push(newItem);
  } else {
    (root.children || []).forEach(child => traverseItems(child, acc));
  }
  return acc;
};

export default function microdata(root: Element): {} | {}[] {
  const results = traverseItems(root, []);

  return typeof root === 'string' || !lookupScope(root.props)
    ? results
    : results[0];
}
