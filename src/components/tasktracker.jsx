import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

const TaskTracker = () => {
    let [task, settask] = useState([]);
    let [value, setvalue] = useState(false)

    let tname = useRef();
    let sdate = useRef();
    let edate = useRef();
    let priority = useRef();
    var cd = new Date();
    useEffect(() => {
        let fetchdata = async () => {
            let response = await axios.get('http://localhost:3002/home-data');
            let data = await response.data;
            let d = [...data];
            d = d.map((task) => {
                let result = ""
                if (new Date(task.sdate) > cd) {
                    result = "Not yet"
                } else if (new Date(task.sdate) < new Date(task.edate) && new Date(task.edate) > cd) {
                    result = " in progress";
                } else {
                    result = "Completed"
                }

                return { ...task, status: result }
            });
            settask(d);
            // console.log(data);
        }
        fetchdata();
    }, [])

    let add_task = () => {
        let data = {
            tname: tname.current.value,
            sdate: sdate.current.value,
            edate: edate.current.value,
            priority: priority.current.value
        }
        axios.post(`http://localhost:3002/home`, data)
        alert('Task Added Successfully')
    }
    let prior = {
        0: "low",
        1: "medium",
        2: "high"
    }


    const deletetask = (_id) => {
        if (window.confirm("Do you really want to delete it")) {
            axios.delete(`http://localhost:3002/delete-data/${_id}`);
            console.log('deleted');
        }
    }

    //edit

    // let [value,setvalue] = useState(false)
    let [number, setNumber] = useState("")


    let editTask = (_id) => {
        axios.get(`http://localhost:3002/tasks/${_id}`)
            .then((response) => {
                console.log(response.data)
            })
            .then((alltask) => {
                tname.current.value = alltask.tname;
            })
        setvalue(true)
        setNumber(_id)
    }


    let handleUpdate = (number) => {

        let updateTask = {
            tname: tname.current.value,
            sdate: sdate.current.value,
            edate: edate.current.value,
            priority: priority.current.value,
        }
        console.log(updateTask)
        axios.put(`http://localhost:3002/tasks/${number}`, updateTask)
        alert("handle save")
        setvalue(false)
    }


    const [currentPage, setCurrentPage] = useState(1);
    const [tasksPerPage, setTasksPerPage] = useState(10);
    let [query, setquery] = useState('')

    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = task
        .filter((item) => item.tname.toLowerCase().includes(query))
        .slice(indexOfFirstTask, indexOfLastTask);

    const pageNumbers = [];
    console.log(pageNumbers);
    for (let i = 1; i <= Math.ceil(task.length / tasksPerPage); i++) {
        pageNumbers.push(i);
    }


    const displayNextData = () => {
        if (currentPage < pageNumbers.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const displayPrevData = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }

    return (
        <section className="hero" style={{ margin: "auto" }}>
            <h1 style={{  fontSize: "40px", margin: "5px" }} className="headings">Task Tracker</h1>
            <div className='tasks' style={{ margin: "auto" }}>
                <h1 className="headings">Add New Task</h1>
                <div className="taskname">
                    <label htmlFor="">Task Name:</label><br />
                    <input type="text" name="tname" ref={tname} required />
                </div>
                <div className="date">
                    <div className="labels">
                        <label htmlFor="">Start Date & Time:</label>
                        <label htmlFor="">End Date & Time:</label>

                    </div>
                    <input type="datetime-local" name="sdate" id="sdate" ref={sdate} required />

                    <input type="datetime-local" name="edate" id="edate" ref={edate} required />
                </div>
                <div className="priority">
                    <label htmlFor="">Priority:</label><br />
                    <select ref={priority}>
                        <option value="0">Low</option>
                        <option value="1">Medium</option>
                        <option value="2">High</option>
                    </select><br />
                    <div className="add">
                        {
                            value === false ? <button onClick={() => add_task()} className="addbtn"  >Add Task</button> :
                                <button onClick={() => handleUpdate(number)} className="orange " >Save</button>
                        }
                    </div>
                </div>
            </div>

                        {/* table */}

            <section className='tasktable'>
                <div className="container" style={{textAlign: "center"}}>
                    <input type="text" placeholder="Search" value={query} onChange={(e) => setquery(e.target.value)} />
                </div>
                <table width="100%" align="cneter" className='tdetails'>
                    <thead>
                        <th>SL NO</th>
                        <th>Task Name</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Action</th>
                    </thead>
                    <tbody>
                        {
                            currentTasks.map(({ tname, sdate, edate, priority, status, _id }, index) => (
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{tname}</td>
                                    <td>{sdate}</td>
                                    <td>{edate}</td>
                                    <td>{prior[priority]}</td>
                                    <td>{status}</td>

                                    <td style={{ display: "flex" }}>
                                        {(status !== "Completed" || status === "Not yet") && <button className="edit" onClick={() => editTask(_id)}>Edit</button>}
                                        {(status !== "Completed" && status !== "Not yet" || status === "in progress") && <button className="delete" onClick={() => deletetask(_id)} >Delete</button>}
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                <div className="buttons" style={{ textAlign: "center" }}>

                    <button className='prev' onClick={() => displayNextData()}>&larr; Prev</button>
                    <button className='next' onClick={() => displayPrevData()}> Next &rarr;</button>
                </div>
            </section>
        </section>
    );
}

export default TaskTracker;