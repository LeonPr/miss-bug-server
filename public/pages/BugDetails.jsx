const { useState, useEffect } = React
const { Link, useParams , useNavigate } = ReactRouterDOM

import { bugService } from '../services/bug.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'


export function BugDetails() {

    const [bug, setBug] = useState(null)
    const { bugId } = useParams()
    const navigate = useNavigate()


    useEffect(() => {
        const fetchBug = async () => {
            try {
                const bugData = await bugService.getById(bugId)
                setBug(bugData)
            } catch (err) {
                if (err.response && err.response.status === 429) {
                    showErrorMsg('Too many requests. Please wait before trying again.')
                    setTimeout(() => {
                        navigate('/bug')
                    }, 3000)
                } else {
                    showErrorMsg('Cannot load bug')
                }
            }
        }

        fetchBug()
    }, [bugId])

    if (!bug) return <h1>Loadings....</h1>
    return bug && <div>
        <h3>Bug Details 🐛</h3>
        <h4>{bug.title}</h4>
        <h3>{bug.description}</h3>
        <p>Severity: <span>{bug.severity}</span></p>
        <Link to="/bug">Back to List</Link>
    </div>

}

