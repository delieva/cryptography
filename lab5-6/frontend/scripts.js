const server = axios.create({
  baseURL: 'http://localhost:3000'
})

const serializeForm = function (form) {
  const obj = {};
  const formData = new FormData(form);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }

  return obj;
};

onRegister = async (e) => {
  e.preventDefault()

  try {
    const postData = serializeForm(document.getElementById('reg-form'))
    const { data } = await server.post('/register', {...postData})
    alert(`Registered new user.\nId: ${data.id}, Login: ${data.login}`)
  } catch (e) {
    alert(`Error occurred\n${e.response.data}`)
  }
}

onLogin = async (e) => {
  e.preventDefault()

  try {
    const postData = serializeForm(document.getElementById('login-form'))
    const { data } = await server.post('/login', {...postData})

    const stringData = Object.entries(data).map(([key, value]) => `${key}: ${value}`).join('\n')
    alert(`Logged in a user.\n${stringData}`)
  } catch (e) {
    alert(`Error occurred\n${e.response.data}`)
  }
}

document.getElementById('reg-form').addEventListener('submit', onRegister)
document.getElementById('login-form').addEventListener('submit', onLogin)