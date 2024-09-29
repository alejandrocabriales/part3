const express = require('express')
const morgan = require('morgan')
const Person=require('./models/phonebook')

const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())

app.use(morgan('tiny'))

morgan.token('body', (request) => JSON.stringify(request.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('dist'))


app.get('/health', (req, res) => {
  // eslint-disable-next-line no-constant-condition
  if (true) throw('error.....  ')
  res.send('ok')
})
app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {

    response.json(result)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {

    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))
})

app.get('/api/info', (request, response) => {
  Person.find({}).then(result => {

    const phonebook = result.map(person => person.name)
    response.send(`<p>Phonebook has info for ${phonebook.length} people</p>
      <p>${new Date()}</p>`)
  })

})


app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name) {
    return response
      .status(400)
      .json({ error: 'content missing' })
  }
  Person.find({ name:body.name }).then(result => {
    if(result.length>0){
      return response
        .status(400)
        .json({ error: 'name must be unique' })
    }
    const person=new Person({
      name: body.name,
      phone: body.number
    })
    person.save().then((result) => {
      response.json(result)
    })

      .catch(error => next(error))
  })
})


app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    phone: body.number,

  }

  Person.findByIdAndUpdate(request.params.id, person, { runValidators: true })
    .then(result => {
      console.log('result',result)
      response.json(result)
    })
    .catch(error => next(error))
})



app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id).then((result) => {
    if(result){
      response
        .status(200)
        .json(result)
        .end()
    } else {
      response
        .status(404)
        .end()
    }
  })
    .catch(error => next(error))
})
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})