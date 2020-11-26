const { xorChar } = require('../utils/xorChar');

const xorStrings = (string1, string2) => {
  let res = ''
  string1.split('').forEach((char, i) => {
    res += xorChar(char, string2[i])
  })

  console.log(res)
}

xorStrings(
  'ad924af7a9cdaf3a1bb0c3e71a27adf37fdf3a474dfef44914b17d8ea2cc86c89d4d72f9e93556a44d71dfb;',
  'a59a0eaeaad7fc3c56fe82fd1f6bb5a769c43a0f0cfae74f0df56fdae3db8d9d840875ecae2557bf563fcea2'
)