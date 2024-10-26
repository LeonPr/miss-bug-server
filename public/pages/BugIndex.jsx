import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'
import { utilService } from '../services/util.service.js'




const { useState, useEffect, useRef } = React

export function BugIndex() {
    const [bugs, setBugs] = useState([])
    const [filterBy, setFilterBy] = useState({ txt: '' })
    const [filterByLabels, setFilterByLabels] = useState({ txtLabels: '' })
    const [sortBy, setSortBy] = useState('date')

    const debouncedFilterByRef = useRef()
    const debouncedFilterByLabelsRef = useRef()

    useEffect(() => {
        loadBugs()
    }, [filterBy, filterByLabels, sortBy])

    // const debouncedFilterBy = useRef(utilService.debounce(setFilterBy, 500))
    // const debouncedFilterByLabel = useRef(utilService.debounce(setFilterByLabels, 500))

    useEffect(() => {
        // Create the debounced function for filterBy
        debouncedFilterByRef.current = utilService.debounce((value) => {
            setFilterBy({ txt: value });
        }, 500);
        
        // Create the debounced function for filterByLabels
        debouncedFilterByLabelsRef.current = utilService.debounce((value) => {
            setFilterByLabels({ txtLabels: value });
        }, 500);
    }, [])

    function loadBugs() {
        bugService.query(filterBy, filterByLabels, sortBy).then(setBugs)
    }

    function onRemoveBug(bugId) {
        bugService
            .remove(bugId)
            .then(() => {
                console.log('Deleted Succesfully!')
                const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => {
                console.log('Error from onRemoveBug ->', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?'),
            severity: +prompt('Bug severity?'),
            description: prompt('Bug description?'),
        }
        bugService
            .save(bug)
            .then((savedBug) => {
                console.log('Added Bug', savedBug)
                setBugs([...bugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch((err) => {
                console.log('Error from onAddBug ->', err)
                showErrorMsg('Cannot add bug')
            })
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?')
        const bugToSave = { ...bug, severity }
        bugService
            .save(bugToSave)
            .then((savedBug) => {
                console.log('Updated Bug:', savedBug)
                const bugsToUpdate = bugs.map((currBug) =>
                    currBug._id === savedBug._id ? savedBug : currBug
                )
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch((err) => {
                console.log('Error from onEditBug ->', err)
                showErrorMsg('Cannot update bug')
            })
    }

    function handleChange({ target }) {
        debouncedFilterByRef.current(target.value)
        // setFilterBy({ txt: target.value })
    }
    function handleLabels({ target }) {
        debouncedFilterByLabelsRef.current(target.value)
        // setFilterByLabels({ txtLabels: target.value })
    }

    return (
        <main>
            <section className='bug-filter'>
                <input onChange={handleChange}
                    className="filter-title"
                    type="text"
                    placeholder="Filter by Title or Description"
                />
                <input onChange={handleLabels}
                    className="filter-labels"
                    type="text"
                    placeholder="Filter by Labels"
                />
                <label className="bug-sort">
                    Sort by:
                    <select onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                        <option value="title">Title</option>
                        <option value="severity">Severity</option>
                        <option value="createdAt">Date</option>
                    </select>
                </label>
            </section>
            <section className='info-actions'>
                <h3>Bugs App</h3>
                <button onClick={onAddBug}>Add Bug ⛐</button>
            </section>
            <main>
                <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
            </main>
        </main>
    )
}
