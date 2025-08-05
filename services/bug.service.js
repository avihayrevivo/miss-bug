import fs from 'fs'
import { makeId, readJsonFile } from "./util.service.js";

const gBugs = readJsonFile('data/bug.json')
const PAGE_SIZE = 3

export const bugService = {
    query,
    getById,
    remove,
    save
}

function query(filterBy) {
    let bugs = [...gBugs]

    if (filterBy.txt) {
        const regex = new RegExp(filterBy.txt, 'i')
        bugs = bugs.filter(bug => regex.test(bug.title))
    }
    if (filterBy.minSeverity) {
        bugs = bugs.filter(bug => bug.severity >= filterBy.minSeverity)
    }
    if (filterBy.pageIdx) {
        const startIdx = filterBy.pageIdx * PAGE_SIZE
        bugs = bugs.slice(startIdx, startIdx + PAGE_SIZE)
    }
    if (filterBy.sortBy.title) {
        bugs = bugs.sort((a, b) => a.title.localeCompare(b.title))
    }
    if (filterBy.sortBy.severity) {
        bugs = bugs.sort((a, b) => {
            return severityOrder[b.severity] - severityOrder[a.severity]
        })
    }
    console.log(bugs);
    
    return Promise.resolve(bugs)
}

function getById(bugId) {
    const bug = gBugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const bugIdx = gBugs.findIndex(bug => bug._id === bugId)
    if (bugIdx === -1) return Promise.reject('Cannot find bug - ' + bugId)
    gBugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}

function save(bugToSave) {
    if (bugToSave._id) {
        const bugIdx = gBugs.findIndex(bug => bug._id === bugToSave._id)
        if (bugIdx === -1) return Promise.reject('Cannot find bug - ' + bugId)
        gBugs[bugIdx] = bugToSave
    } else {
        bugToSave._id = makeId()
        gBugs.unshift(bugToSave)
    }

    return _saveBugsToFile().then(() => bugToSave)
}

function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(gBugs, null, 4)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}