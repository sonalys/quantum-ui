export const getSize = (size) : string => {
  var sizes = ['B', 'kB', 'mB', 'gB', 'tB', 'pB', 'eB', 'zB', 'yB'];
  for (var i = 1; i < sizes.length; i++) {
      if (size < Math.pow(1024, i))
        return (Math.round((size / Math.pow(1024, i - 1)) * 100) / 100) + " " + sizes[i - 1];
  }
  return size;
}