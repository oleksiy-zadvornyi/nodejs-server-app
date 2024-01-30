import express from 'express'
import ip from 'ip'
import { JSONFilePreset } from 'lowdb/node'
import uniqid from 'uniqid'

const app = express()
const PORT = process.env.PORT ?? 3000

const defaultData = { posts: [], comments: [] }
const db = await JSONFilePreset('db.json', defaultData)

app.use(express.json())

app.get('/', (_, res) => {
  res.redirect('/posts')
})

app.get('/posts', (_, res) => {
  res.json(db.data.posts)
})

app.get('/posts/:id', (req, res) => {
  const post = db.data.posts.find((e) => e.id === req.params.id)
  if (post) {
    res.json(post)
    return
  }

  res.status(403).end()
})

app.post('/posts', (req, res) => {
  const post = { id: uniqid(), ...req.body }
  db.update(({ posts }) => posts.push(post))
  res.json(post)
})

app.put('/posts/:id', (req, res) => {
  const index = db.data.posts.findIndex((e) => e.id === req.params.id)
  if (index >= 0) {
    const post = { ...db.data.posts[index], ...req.body }
    db.update(({ posts }) => (posts[index] = post))
    res.json(post)
    return
  }
  res.status(403).end()
})

app.delete('/posts/:id', (req, res) => {
  const index = db.data.posts.findIndex((e) => e.id === req.params.id)
  if (index >= 0) {
    db.data.posts = db.data.posts.filter((e) => e.id !== req.params.id)
    db.data.comments = db.data.comments.filter(
      (e) => e.postId !== req.params.id
    )
    db.write()
    res.status(200).end()
    return
  }
  res.status(403).end()
})

// Comments

app.get('/comments/:id', (req, res) => {
  const comment = db.data.comments.find((e) => e.id === req.params.id)
  if (comment) {
    res.json(comment)
    return
  }

  res.status(403).end()
})

app.get('/posts/:id/comments', (req, res) => {
  res.json(db.data.comments.filter((e) => e.postId === req.params.id))
})

app.post('/posts/:id/comments', (req, res) => {
  const index = db.data.posts.findIndex((e) => e.id === req.params.id)
  if (index >= 0) {
    const comment = { id: uniqid(), ...req.body }
    db.update(({ comments }) => comments.push(comment))
    res.json(comment)
    return
  }
  res.status(403).end()
})

app.put('/comments/:id', (req, res) => {
  const index = db.data.comments.findIndex((e) => e.id === req.params.id)
  if (index >= 0) {
    const comment = { ...db.data.comments[index], ...req.body }
    db.update(({ comments }) => (comments[index] = comment))
    res.json(comment)
    return
  }
  res.status(403).end()
})

app.delete('/comments/:id', (req, res) => {
  const index = db.data.comments.findIndex((e) => e.id === req.params.id)
  if (index >= 0) {
    db.data.comments = db.data.comments.filter((e) => e.id !== req.params.id)
    db.write()
    res.status(200).end()
    return
  }
  res.status(403).end()
})

app.listen(PORT, () =>
  console.log(`Server has been started ${ip.address()}:${PORT}`)
)
