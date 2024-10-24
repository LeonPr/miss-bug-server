import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'

const app = express()
// app.get('/', (req, res) => res.send('Hello there'))
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())


app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot get bugs')
        })
})

app.post('/api/bug', (req, res) => {
    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        createdAt: +req.body.createdAt,
        labels: req.body.labels
    }
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
})
app.put('/api/bug', (req, res) => {
    console.log('req.body._id', req.body._id)
    const bugToSave = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        createdAt: +req.body.createdAt,
        labels: req.body.labels
    }
    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
})

app.get('/api/bug/:bugId', (req, res) => {
    let visitedBugsCount = parseInt(req.cookies.visitedCount) || 0
    const lastVisitTime = parseInt(req.cookies.lastVisitTime) || 0
    const currentTime = Date.now()
    if (visitedBugsCount >= 3) {
        if (currentTime - lastVisitTime < 15000) {
            return res.status(429).send('Too many requests. Please wait a while before accessing bug details again.')
        }
    }
    visitedBugsCount++;
    res.cookie('visitedCount', visitedBugsCount, { maxAge: 15 * 1000 })
    res.cookie('lastVisitTime', currentTime, { maxAge: 15 * 1000 })
    console.log('visitedCount:', visitedBugsCount)

    const { bugId } = req.params
    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(500).send('Cannot get bug')
        })
})
app.delete('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId
    bugService.remove(bugId)
        .then(() => res.send(bugId))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot remove bug')
        })
})

app.listen(3040, () => console.log('Server ready at port 3040'))
