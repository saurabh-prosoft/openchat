export const getSlug = (title) => `#pop-${title.toLowerCase().replaceAll(' ', '-')}`;

export const trapBetween = (root) => {
  if (!root) return { first: null, last: null };

  const treeWalker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    { acceptNode: (node) => (node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP) },
    false
  );

  let currNode = null,
    firstTabbableNode = treeWalker.nextNode(),
    lastTabbableNode = null;

  while ((currNode = treeWalker.nextNode()) !== null) {
    lastTabbableNode = currNode;
  }

  if (!lastTabbableNode) lastTabbableNode = firstTabbableNode;

  return { first: firstTabbableNode, last: lastTabbableNode };
};

export const trapFocus = (event, el, bound) => {
  if (event.key === 'Tab') {
    if (!el.contains(document.activeElement)) {
      bound.first?.focus();
      return;
    }

    if (event.shiftKey) {
      if (document.activeElement === bound.first) {
        bound.last.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === bound.last) {
        bound.first.focus();
        event.preventDefault();
      }
    }
  }
};

export const throttle = (cb, delay) => {
  let timerHandle, args;
  const throttled = (...a) => {
    args = a;
    if (!timerHandle) {
      cb(...args);
      args = null;
      timerHandle = setTimeout(() => {
        timerHandle = null;
        if (args) {
          throttled(...args);
        }
      }, delay);
    }
  };
  return throttled;
};

export const getImageDimensions = async (file) => {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  return {
    img,
    width: img.width,
    height: img.height
  };
};

export const resizeImage = async (image, width, height) => {
  const bitmap = await createImageBitmap(image, {
    resizeWidth: width,
    resizeHeight: height
  });

  // return bitmap;

  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('bitmaprenderer');
  ctx.transferFromImageBitmap(bitmap);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve));
  const resizedImage = new Image();
  resizedImage.src = URL.createObjectURL(blob);
  await resizedImage.decode();
  return resizedImage;
};

export const distance = (a, b) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
export const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
export const clamp = (val, [a, b]) => Math.max(Math.min(val, Math.max(a, b)), Math.min(a, b));
