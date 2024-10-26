import fs from 'fs'
import { utilService } from './util.service.js'

const bugs = utilService.readJsonFile('data/bug.json')
const PAGE_SIZE = 2

export const bugService = {
    query,
    getById,
    remove,
    save
}

function query(filterBy) {
    return Promise.resolve(bugs).then(res => {
        let data = res
        // console.log('filterBy', filterBy);
        if (filterBy.txt) {
            data = data.filter(bug => bug.title.toLowerCase().includes(filterBy.txt) || bug.description.toLowerCase().includes(filterBy.txt))
        }
        if (filterBy.txtLabels) {
            data = data.filter(bug =>
                bug.labels.some(label => label.toLowerCase().includes(filterBy.txtLabels))
            )
        }
        if (+filterBy.pageIdx !== -1) {
            const startIdx = +filterBy.pageIdx * PAGE_SIZE 
            data = data.slice(startIdx, startIdx + PAGE_SIZE)
        }
        if (filterBy.sortBy) {
            if (filterBy.sortBy === 'date') {
                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            } else if (filterBy.sortBy === 'title') {
                data.sort((a, b) => a.title.localeCompare(b.title))
            } else if (filterBy.sortBy === 'severity') {
                data.sort((a, b) => a.severity - b.severity)
            }
        }
        return data
    })
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug', bugId)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx < 0) return Promise.reject('Cannot find bug', bugId)
    bugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}

function save(bugToSave) {
    if (bugToSave._id) {
        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        bugs[bugIdx] = bugToSave
    } else {
        bugToSave._id = utilService.makeId()
        bugs.unshift(bugToSave)
    }
    return _saveBugsToFile().then(() => bugToSave)
}


function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}