const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

function generateRandomId(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

let users = {}
let usersExercise = {}

app.use(cors())
app.use(express.static('public'))
//app.use(express.json())
app.use(express.urlencoded({ extended: true })); // form

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  let id = generateRandomId()
  let newUser = {
    username: req.body.username,
    _id: id
  }
  users = {
    [id]: newUser,
    ...users
  }
  res.send(newUser)
});


app.get('/api/users', (req, res) => {
  res.send(Object.values(users))
});

app.post('/api/users/:_id/exercises', (req, res) => {
  let userResponse = {};

  const date = new Date(req.body.date ? new Date(req.body.date).setDate(new Date(req.body.date).getDate() + 1) : new Date(new Date().setDate(new Date().getDate())));

  // const formattedDate = date.toISOString().split('T')[0];

  const readableDate = date.toDateString();

  userResponse = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: readableDate,
    ...userResponse,
  };

  usersExercise = {
    ...usersExercise,
    [req.params._id]: {
      ...users[req.params._id],
      log: usersExercise[req.params._id]?.log ? [...usersExercise[req.params._id].log, userResponse] : [userResponse]
    }
  };

  res.send({
    ...users[req.params._id],
    ...userResponse,
  });
});


app.get('/api/users/:_id/logs', (req, res) => {
  const { from, to, limit } = req.query;
  let logs = usersExercise[req.params._id].log;

  if (from) {
    const fromDate = new Date(from);
    logs = logs.filter(log => new Date(log.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    logs = logs.filter(log => new Date(log.date) <= toDate);
  }

  if (limit) {
    logs = logs.slice(0, parseInt(limit));
  }

  res.send({
    count: logs.length,
    log: logs
  });
});

const listener = app.listen(process.env.PORT || 3002, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
