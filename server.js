import express from 'express' 
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'



const app = express() 
// app.get('/', (req, res) => res.send('Hello there'))
app.use(express.static('public'))
app.use(cookieParser())

//* Express Routing:
//* READ LIST
app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot get bugs')
        })
})

//* SAVE
app.get('/api/bug/save', (req, res) => {
    console.log('req', req);
    const bugToSave = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: +req.query.createdAt,
    }

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
})

//* READ
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
    res.cookie('visitedCount', visitedBugsCount, { maxAge: 15 * 1000 });
    res.cookie('lastVisitTime', currentTime, { maxAge: 15 * 1000 });
    console.log('visitedCount:', visitedBugsCount)

    const { bugId } = req.params
    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(500).send('Cannot get bug')
        })
})


//* REMOVE
app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send(`bug ${bugId} removed successfully!`))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(500).send('Cannot remove bug')
        })
})




app.listen(3040, () => console.log('Server ready at port 3040'))
