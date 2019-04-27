var stringx = module.exports;

stringx.validate64 = (src) => {
  if (src.length < 1 || src.length > 63) {
    return false;
  }

  if (src[0] < 'a' || src[0] > 'z') {
    return false;
  }

  for (var c of src) {
    if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || (c === '_')) {
      continue;
    }

    return false;
  }

  if (src[src.length - 1] < 'a' || src[src.length - 1] > 'z') {
    return false;
  }

  return true;
};

stringx.validateN = (src, len) => {
  if (src.length != len) {
    return false;
  }

  for (var c of src) {
    if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')) {
      continue;
    }

    return false;
  }

  return true;
};