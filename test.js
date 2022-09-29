var obj1 = {
//   rank: {
//     range: [9, 100],
//   },
  level: {
    value: 10,
  },
//   age: {
//     multi_value: [1, 2, 3, 4, 5, 6],
//   },
};

var obj2 = {
  level: {
    value: 10,
  },
//   rank: {
//     range: [1, 10],
//   },
//   age: {
//     multi_value: [100],
//   },
};

function test() {
  for ([key, value] of Object.entries(obj1)) {
    // console.log({ key, value, d: obj2[key] });
    if (!obj2[key]) return 0;

    if (value.value) {
      if (!obj2[key].value || obj2[key].value != value.value) {
        return 0;
      }
    } else if (value.range) {
      if (
        !obj2[key].range ||
        !(
          (obj2[key].range[0] >= value.range[0] &&
            obj2[key].range[0] <= value.range[1]) ||
          (obj2[key].range[1] >= value.range[0] &&
            obj2[key].range[1] <= value.range[1])
        )
      ) {
        return 0;
      }
    } else if (value.multi_value) {
      if (
        !obj2[key].multi_value ||
        hasNoCommonValues(value.multi_value, obj2[key].multi_value)
      ) {
        return 0;
      }
    }
  }
  return 1;
}

function hasNoCommonValues(array1, array2) {
  if (!array1.length || !array2.length) return 1;
  array1 = array1.filter((item) => array2.includes(item));
  if (!array1.length) return 1;
  return 0;
}
console.log(test());
