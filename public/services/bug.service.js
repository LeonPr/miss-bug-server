
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'

const STORAGE_KEY = 'bugDB'
const BASE_URL = '/api/bug/'
_createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
}

function query(filters, filterByLabels, sortBy) {
    //  return axios.get(BASE_URL).then(res => res.data)
    const params={
        ...filters,
        ...filterByLabels,
        sortBy
    }
    return axios.get(BASE_URL,{params}).then(res => res.data)
    // return axios.get(BASE_URL,{params:filters,filterByLabels,sortBy}).then(res => {
    //     let data = res.data
    //     if (filters.txt) {
    //         data = data.filter(bug => bug.title.includes(filters.txt) || bug.description.includes(filters.txt))
    //     }
    //     if (filterByLabels.txtLabels) {
    //         data = data.filter(bug =>
    //             bug.labels.some(label => label.includes(filterByLabels.txtLabels))
    //         )
    //     }
    //     if (sortBy) {
    //         if (sortBy === 'date') {
    //             data.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
    //         } else if (sortBy === 'title') {
    //             data.sort((a, b) => a.title.localeCompare(b.title))
    //         }else if (sortBy === 'severity') {
    //             data.sort((a, b) => a.severity -b.severity)
    //         }
    //     }
    //     return data
    // })
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId).then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId).then(res => res.data)
}

function save(bug) {
    const url = BASE_URL
    if (bug._id) {
        return axios.put(BASE_URL, bug).then(res => res.data)
    } else {
        return axios.post(BASE_URL, bug).then(res => res.data)
    }
}

function _createBugs() {
    let bugs = utilService.loadFromStorage(STORAGE_KEY)
    if (!bugs || !bugs.length) {
        bugs = [
            {
                title: "Infinite Loop Detected",
                severity: 4,
                _id: "1NF1N1T3"
            },
            {
                title: "Keyboard Not Found",
                severity: 3,
                _id: "K3YB0RD"
            },
            {
                title: "404 Coffee Not Found",
                severity: 2,
                _id: "C0FF33"
            },
            {
                title: "Unexpected Response",
                severity: 1,
                _id: "G0053"
            }
        ]
        utilService.saveToStorage(STORAGE_KEY, bugs)
    }
}
