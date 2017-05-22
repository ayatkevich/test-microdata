import microdata from './';

export function test(wrapper) {
  return (
    typeof wrapper === 'object' &&
    'type' in wrapper &&
    'props' in wrapper &&
    'children' in wrapper
  );
}

export function print(wrapper, serializer) {
  return serializer(microdata(wrapper));
}
