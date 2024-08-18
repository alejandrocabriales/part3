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


app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
  
    response.json(result)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(note => {
    response.json(note)
  })
})



app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name || !body.number) {
        return response
            .status(400)
            .json({error: 'content missing'})
    }

  
    Person.find({name:body.name}).then(result => {
        if(result.length>0){
            return response
            .status(400)
            .json({error: 'name must be unique'})
        }
        const person=new Person({
          name: body.name,
          phone: body.number
        })
          person.save().then(() => {
              response.json(person)
          })
      })
    })
    
app.delete('/api/persons/:id', (request, response) => {
   const phonebook = Person.findById(request.params.id)
   phonebook.deleteOne().then((result) => {
    response
        .status(204)
        .json(result)
        .end()
   })
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})