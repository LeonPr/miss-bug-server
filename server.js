import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { userService } from './services/user.service.js'


const app = express()
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
//!bugs server
app.get('/api/bug', (req, res) => {
    const {txt="",txtLabels="",sortBy="",pageIdx=0} =req.query
    const filterBy={
        txt,
        txtLabels,
        sortBy,
        pageIdx
    }
    bugService.query(filterBy)
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

//!user server

app.get('/api/user', (req, res) => {
    const {fullname="",score=0} =req.query
    const filterBy={
        fullname,
        score,
    }
    userService.query(filterBy)
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error('Cannot get users', err)
            res.status(500).send('Cannot get users')
        })
})

app.post('/api/user', (req, res) => {
    const userToSave = {
        username: req.body.username,
        fullname: req.body.fullname,
        password: req.body.password,
        score: +req.body.score,
    }
    userService.save(userToSave)
        .then(savedUser => res.send(savedUser))
        .catch(err => {
            loggerService.error('Cannot save user', err)
            res.status(500).send('Cannot save user')
        })
})

app.put('/api/user', (req, res) => {
    console.log('req.body._id', req.body._id)
    const bugToSave = {
        _id: req.body._id,
        username: req.body.username,
        fullname: req.body.fullname,
        password: req.body.password,
        score: +req.body.score,
    }
    userService.save(userToSave)
        .then(savedUser => res.send(savedUser))
        .catch(err => {
            loggerService.error('Cannot save user', err)
            res.status(500).send('Cannot save user')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params
    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error('Cannot get user', err)
            res.status(500).send('Cannot get user')
        })
})
app.delete('/api/user/:userId', (req, res) => {
    const userId = req.params.userId
    userService.remove(userId)
        .then(() => res.send(userId))
        .catch(err => {
            loggerService.error('Cannot remove user', err)
            res.status(400).send('Cannot remove user')
        })
})
//* Auth API
app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    
    userService.checkLogin(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(401).send('Invalid Credentials')
            }
        })
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    
    userService.save(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(400).send('Cannot signup')
            }
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})

app.listen(3040, () => console.log('Server ready at port 3040'))
