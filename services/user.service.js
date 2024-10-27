import fs from 'fs'
import Cryptr from 'cryptr'

import { utilService } from './util.service.js'

const users = utilService.readJsonFile('data/user.json')
const cryptr = new Cryptr(process.env.SECRET1 || 'secret-puk-1234')

export const userService = {
    query,
    getById,
    remove,
    save,

    checkLogin,
	getLoginToken,
	validateToken,
}

function query(filterBy) {
    return Promise.resolve(users).then(res => {
        let data = res
        if (filterBy.fullname) {
            data = data.filter(user => user.fullname.toLowerCase().includes(filterBy.fullname))
        }
        if (filterBy.score) {
            data = data.filter(user => user.score === filterBy.score)
        }
        // if (+filterBy.pageIdx !== -1) {
        //     const startIdx = +filterBy.pageIdx * PAGE_SIZE
        //     data = data.slice(startIdx, startIdx + PAGE_SIZE)
        // }
        return data
    })
}

function getById(userId) {
    const user = users.find(user => user._id === userId)
    if (!user) return Promise.reject(`Cannot find user ${userId}`)
    return Promise.resolve(user)
}

function remove(userId) {
    const userIdx = users.findIndex(user => user._id === userId)
    if (userIdx < 0) return Promise.reject(`Cannot find user ${userId}`)
    users.splice(userIdx, 1)
    return _saveUsersToFile()
}

function save(userToSave) {
    console.log('userToSave', userToSave)
    if (userToSave._id) {
        const userIdx = users.findIndex(user => user._id === userToSave._id)
        users[userIdx] = userToSave
    } else {
        userToSave._id = utilService.makeId()
        users.unshift(userToSave)
    }
    return _saveUsersToFile().then(() => userToSave)
}

function checkLogin({ username, password }) {
    // You might want to remove the password validation for dev
	var user = users.find(user => 
        user.username === username && user.password === password)
        
	if (user) {
		user = {
			_id: user._id,
			fullname: user.fullname,
			isAdmin: user.isAdmin,
		}
	}
	return Promise.resolve(user)
}

function getLoginToken(user) {
	const str = JSON.stringify(user)
	const encryptedStr = cryptr.encrypt(str)
	return encryptedStr
}

function validateToken(token) {
	if (!token) return null
    
	const str = cryptr.decrypt(token)
	const user = JSON.parse(str)
	return user
}

function _saveUsersToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(users, null, 4)
        fs.writeFile('data/user.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}