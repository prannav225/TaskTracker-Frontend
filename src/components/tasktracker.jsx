import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

const TaskTracker = () => {
    let [task, settask] = useState([]); //to display on DOM
    let [value, setvalue] = useState(false) //to edit and update task
    // let [edited, setEdited] = useState(0);

    let tname = useRef();
    let sdate = useRef();
    let edate = useRef();
    let search_edate = useRef();
    let search_sdate = useRef();
    
    let priority = useRef();

    var cd = new Date();

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

    //to fetch data and display it on DOM
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
    }, [task])


    //add data to database
    let add_task = () => {
       let data ={
        tname: tname.current.value,
        sdate: sdate.current.value,
        edate: edate.current.value,
        priority: priority.current.value,
        addedon: new Date().toLocaleString()
       }
        console.log(data);
        axios.post(`http://localhost:3002/home`, data)
            .then(res => {
                alert(res.data.message)
                // setEdited(edited + 1);
            })
            .catch(err => {
                alert(err.data.message)
            })
    }


    let prior = {
        0: "low",
        1: "medium",
        2: "high"
    }

    //delete data from database with confirm
    const deletetask = (_id) => {
        if (window.confirm("Do you really want to delete it")) {
            axios.delete(`http://localhost:3002/delete-data/${_id}`);
            console.log('deleted');
        }
    }

    //edit data
    let [number, setNumber] = useState("")

    let editTask = (_id) => {
        axios.get(`http://localhost:3002/tasks/${_id}`)
            .then((response) => {
                console.log(response.data)
            })
            .then((alltask) => {
                tname.current.value = alltask.tname;
                sdate.current.value = alltask.sdate;
                edate.current.value = alltask.edate;
                priority.current.value = alltask.priority;
            })
        setvalue(true)
        setNumber(_id)
    }


    //update data
    let handleUpdate = (number) => {

        let updateTask = {
            tname: tname.current.value,
            sdate: sdate.current.value,
            edate: edate.current.value,
            priority: priority.current.value,
        }
        console.log(updateTask)
        axios.put(`http://localhost:3002/tasks/${number}`, updateTask)
        alert("Task has been Updated")
        setvalue(false)
    }


    //previous button
    const displayNextData = () => {
        if (currentPage < pageNumbers.length) {
            setCurrentPage(currentPage + 1);
        }
    };


    //next button
    const displayPrevData = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }

    //handlefilters
    let handleFilters = () => {
        var selects = document.querySelector("#filter_priority");
        console.log(selects.value);

        let startDate = new Date(sdate.current.value);
        let endDate = new Date(edate.current.value);
        console.log(startDate);
        console.log(endDate)

        if (selects.value == "null") {
            let t = [...task];
            t = t.filter((task) => { return (new Date(task.sdate) >= startDate && new Date(task.sdate) <= endDate) })
            console.log(t);
            settask(t);
        }
        else {
            let t = [...task];
            t = t.filter((task) => { return (new Date(task.sdate) >= startDate && new Date(task.sdate) <= endDate && selects.value == task.priority) })
            console.log(t);
            settask(t);
        }

    }

    return (
        <section className="hero" style={{ margin: "auto" }}>
            <h1 style={{ fontSize: "40px", margin: "5px" }} className="headings">Task Tracker</h1>


            {/* Add task  */}
            <div className='tasks' style={{ margin: "auto" }}>
                <h1 className="headings">Add New Task</h1>
                <div className="taskname">
                    <label htmlFor="">Task Name:</label><br />
                    <input type="text" name="tname" ref={tname} required placeholder='Enter your Task here' />
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
                        <option>Select Priority</option>
                        <option value="0">Low</option>
                        <option value="1">Medium</option>
                        <option value="2">High</option>
                    </select><br />
                    <div className="add">
                        {
                            value === false ? <button onClick={() => add_task()} className="addbtn">Add Task</button> :
                                <button onClick={() => handleUpdate(number)} className="addbtn" >Update</button>
                        }
                    </div>
                </div>
            </div>


            {/* Display table */}
            <section className='tasktable'>


                {/* Search Box */}
                <div className="searchBox">
                    <h1>Search your Tasks here </h1>
                    <input type="text" placeholder="Search Your Task Here" value={query} onChange={(e) => setquery(e.target.value)} style={{ marginRight: "10px" }} /> <br />
                    <h4>Apply Filter</h4>
                    <select name="" id="filter_priority" style={{ width: "150px" }} >
                        <option value="null">Select Priority</option>
                        <option value="0">Low</option>
                        <option value="1">Medium</option>
                        <option value="2">High</option>
                    </select>

                    <div className="dates">
                        <label htmlFor="">Start Date & Time:</label>
                        <label htmlFor="">End Date & Time:</label>

                    </div>
                    <div className="dateandtime">

                        <input type="datetime-local" name="sdate" id="sdate" ref={search_sdate} required />

                        <input type="datetime-local" name="edate" id="edate" ref={search_edate} required />
                    </div>
                    <button onClick={handleFilters} className="apply_filters">Apply filters</button>
                </div>


                <table width="100%" align="cneter" className='tdetails'>
                    <thead>
                        <th>SL NO</th>
                        <th>Task Name</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Added</th>
                        <th>Action</th>
                    </thead>
                    <tbody>
                        {
                            currentTasks.map(({ tname, sdate, edate, priority, status, _id, addedon }, index) => (
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{tname}</td>
                                    <td>{new Date(sdate).toLocaleString()}</td>
                                    <td>{new Date(edate).toLocaleString()}</td>
                                    <td>{prior[priority]}</td>
                                    <td>{status}</td>
                                    <td>{addedon}</td>
                                    <td className="butns">
                                        {(status !== "Completed" || status === "Not yet" || status === "in progress") && <i onClick={() => editTask(_id)} className="edit fa-solid fa-pen-to-square fa-1.5x"></i>}
                                        {(status !== "Completed" && status === "Not yet") && <i onClick={() => deletetask(_id)} className="fa-solid fa-trash delete fa-1.5x"></i>}

                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>


                {/* Next and Previous Buttons */}
                <div className="buttons" style={{ textAlign: "center" }}>

                    <button className='prev' onClick={() => displayPrevData()}>&larr;</button>
                    <button className='next' onClick={() => displayNextData()}>  &rarr;</button>
                </div>
            </section>
        </section >
    );
}

export default TaskTracker;