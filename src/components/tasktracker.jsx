import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

const TaskTracker = () => {
    // !Define state variables for tasks to display, whether or not to display
    // !a form for editing a task, and how many times a task has been edited

    let [task, settask] = useState([]); //to display on DOM
    let [value, setvalue] = useState(false) //to edit and update task
    let [edited, setEdited] = useState(0);

    //!Create refs for form input elements
    let tname = useRef();
    let sdate = useRef();
    let edate = useRef();
    let search_edate = useRef();
    let search_sdate = useRef();
    let priority = useRef();

    //!Define state variables for current page and number of tasks to display per page
    const [currentPage, setCurrentPage] = useState(1);
    const [tasksPerPage, setTasksPerPage] = useState(10);

    // !Define state variable for search query
    let [query, setquery] = useState('')

    //*Calculate index of last and first task to display on current page
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;

    //*Filter tasks based on search query and slice based on current page
    const currentTasks = task
        .filter((item) => item.tname.toLowerCase().includes(query))
        .slice(indexOfFirstTask, indexOfLastTask);

    //*Create array of page numbers based on total number of tasks and tasks per page
    const pageNumbers = [];
    console.log(pageNumbers);
    for (let i = 1; i <= Math.ceil(task.length / tasksPerPage); i++) {
        pageNumbers.push(i);
    }

    //*Get current date
    var cdate = new Date();

    //*Fetch task data from server and set state variables
    useEffect(() => {
        let fetchdata = async () => {
            let response = await axios.get('http://localhost:3002/home-data');
            let data = await response.data;
            let d = [...data];

            //? Add status property to each task object based on current date
            d = d.map((task) => {
                let result = ""
                if (new Date(task.sdate) > cdate) {
                    result = "Not yet"
                } else if (new Date(task.sdate) < new Date(task.edate) && new Date(task.edate) > cdate) {
                    result = " in progress";
                } else {
                    result = "Completed"
                }
                return { ...task, status: result }
            });

            //? Set task state variable and increment edited state variable to trigger useEffect
            settask(d);
            // console.log(data);
            setEdited(edited + 1)
        }
        fetchdata();
    },[task,edited])


    //!add data to database
    let add_task = () => {
        let data = {
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
                setEdited(edited + 1);
            })
            .catch(err => {
                alert(err.data.message)
            })
    }

    //! Define object for mapping priority values to strings
    let prior = {
        0: "low",
        1: "medium",
        2: "high"
    }

    //!delete data from database with confirm.
    //?This function deletes a task from the database using its ID. It first prompts the user with a confirmation dialog before proceeding with the deletion. If the user confirms the deletion, it sends a DELETE request to the server using Axios and updates the state by incrementing the edited variable.
    const deletetask = (_id) => {
        if (window.confirm("Do you really want to delete it")) {
            axios.delete(`http://localhost:3002/delete-data/${_id}`);
            console.log('deleted');
            setEdited(edited + 1);
        }
    }

    //!edit data
    //?This function is responsible for editing a task. It first makes a GET request to the server to retrieve the task information using its ID. After that, it updates the values of the input fields in the form using the retrieved information. Finally, it sets the value and number states to enable the form for editing and to store the ID of the task being edited.
    let [number, setNumber] = useState("");
    let editTask = (_id) => {
        axios.get(`http://localhost:3002/tasks/${_id}`)
        .then((response) => {
            console.log(response.data)
            tname.current.value = response.data.tname;
            sdate.current.value = response.data.sdate;
            edate.current.value = response.data.edate;
            priority.current.value = response.data.priority;
            setvalue(true);
            setNumber(_id);
        })
    }
    

    //!update data
    //?This function is called when the user clicks the "Update" button to update an existing task. It first creates an object with the new task information, validates it to ensure that all fields are filled, and then sends a PUT request to the server to update the task information. After updating the task, it shows an alert message and updates the state by incrementing edited and disabling the form.
    let handleUpdate = (number) => {
        let updateTask = {
            tname: tname.current.value,
            sdate: sdate.current.value,
            edate: edate.current.value,
            priority: priority.current.value,
        }
        if (Object.keys(updateTask).length === 0) {
            alert(`Please fill in the details`)
        } else {
            console.log(updateTask)
            axios.put(`http://localhost:3002/tasks/${number}`, updateTask)
            setEdited(edited + 1);
            alert("Task has been Updated")
            setvalue(false)
        }
    }
    

    //*These functions are responsible for navigating through the pages of the table. They increment or decrement the currentPage state depending on which button is clicked.
    //!previous button
    const displayNextData = () => {
        if (currentPage < pageNumbers.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    //!next button
    const displayPrevData = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }


    //!handlefilters
    // let handleFilters = () => {
    //     var selects = document.querySelector("#filter_priority");
    //     console.log(selects.value);
    //     setEdited(edited + 1)

    //     let startDate = new Date(search_sdate.current.value);
    //     let endDate = new Date(search_edate.current.value);
    //     console.log(startDate);
    //     console.log(endDate)

    //     if (selects.value == "null") {
    //         let t = [...task];
    //         t = t.filter((task) => { return (new Date(task.search_sdate) >= startDate && new Date(task.search_sdate) <= endDate) })
    //         console.log(t);
    //         settask(t);
    //     }
    //     else {
    //         let t = [...task];
    //         t = t.filter((task) => { return (new Date(task.search_sdate) >= startDate && new Date(task.search_sdate) <= endDate && selects.value == task.priority) })
    //         console.log(t);
    //         settask(t);
    //     }
    // }
   
    let handleFilters = () => {
        let sd = search_sdate.current.value;
        let ed = search_edate.current.value;
        let filteredTasks = task.filter((item) => {
            let start = new Date(sd);
            let end = new Date(ed);
            let taskDate = new Date(item.sdate);
            return (
                (sd === "" || taskDate >= start) &&
                (ed === "" || taskDate <= end)
            );
        });
        settask(filteredTasks);
        setCurrentPage(1); // Reset current page to 1 after filtering
    };
    

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

            <section className='tasktable'>

                {/* Search Box */}
                <div className="searchBox">
                    <h1>Search your Tasks here </h1>
                    <input type="text" placeholder="Search Your Task Here" value={query} onChange={(e) => setquery(e.target.value)} style={{ marginRight: "10px" }} /> <br />

                    <h4>Apply Filter</h4>
                    {/* <select name="" id="filter_priority" style={{ width: "150px" }} >
                        <option value="null">Select Priority</option>
                        <option value="low">Low</option>
                        <option value="med">Medium</option>
                        <option value="hig">High</option>
                    </select> */}

                    <div className="dates">
                        <label htmlFor="">Start Date & Time:</label>
                        <label htmlFor="">End Date & Time:</label>

                    </div>
                    <div className="dateandtime">

                        <input type="datetime-local" name="search_sdate" id='sdate' ref={search_sdate} />

                        <input type="datetime-local" name="search_edate" id='edate' ref={search_edate} />
                    </div>
                    <button onClick={handleFilters} className="apply_filters">Apply filters</button>
                </div>


                {/* Display table */}
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