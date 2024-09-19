import {Component} from 'react'
import './index.css'
import add from '../icons_FEtask/add.svg'
import dots from '../icons_FEtask/3 dot menu.svg'

class KanbanBoard extends Component{
    state = {groupBy: 'status', orderBy:'priority', ticketsData: [], usersData:[]}

    componentDidMount() {
        this.getKanbanData()
        const savedGroupBy = localStorage.getItem('groupBy')
        const savedOrderBy = localStorage.getItem('orderBy')
        if (savedGroupBy) this.setState({ groupBy: savedGroupBy })
        if (savedOrderBy) this.setState({ orderBy: savedOrderBy })
    }

    getKanbanData = async () => {
        const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
        const data = await response.json()
        const {tickets,users}=data
        this.setState({ticketsData:tickets, usersData:users})
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.groupBy !== this.state.groupBy) {
            localStorage.setItem('groupBy', this.state.groupBy)
        }
        if (prevState.orderBy !== this.state.orderBy) {
            localStorage.setItem('orderBy', this.state.orderBy)
        }
    }

    onChangeGroupBy=(event)=>{
        this.setState({groupBy: event.target.value})
    }
    onChangeOrderBy=(event)=>{
        this.setState({orderBy: event.target.value})
    }

    groupTickets = (tickets, groupBy) => {
        const{usersData}=this.state
        const grouped = {};
        tickets.forEach(ticket => {
            let key
            if(groupBy==='user'){
                key= ticket['userId']
                const array=usersData.find(item=> item.id===key)
                key=array.name
            }
            else{
                key = ticket[groupBy];
            }
            if(key===0) key='No priority'
            else if(key===1) key='Low'
            else if(key===2) key='Medium'
            else if(key===3) key='High'
            else if(key===4) key='Urgent'
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(ticket);
        });
        return grouped;
    };

    sortTicketsByOption = (groupedTickets, option) => {
        const sortedTickets = {};
    
        Object.keys(groupedTickets).forEach((groupTitle) => {
            const group = groupedTickets[groupTitle];
            sortedTickets[groupTitle] =
                option === "priority"
                ? group.sort((a, b) => b.priority - a.priority)
                : group.sort((a, b) => a.title.localeCompare(b.title));
        });
        return sortedTickets;
    };

    render(){
        const {groupBy,orderBy,ticketsData}=this.state
        const groupedTickets = this.groupTickets(ticketsData, groupBy);
        const sortedTickets = this.sortTicketsByOption(groupedTickets, orderBy);
        
        return(
            <>
            <nav className='nav-header'>
                <div className="dropdown-container">
                    <div className="dropdown">
                        <label htmlFor="grouping">Grouping</label>
                        <select id="grouping" className="board-control" value={groupBy} onChange={this.onChangeGroupBy}>
                            <option value="status">Status</option>
                            <option value="user">User</option>
                            <option value="priority">Priority</option>
                        </select>
                    </div>
                    <div className="dropdown">
                    <label htmlFor="ordering">Ordering</label>
                        <select id="ordering" className="board-control" value={orderBy} onChange={this.onChangeOrderBy}>
                            <option value="priority">Priority</option>
                            <option value="pitle">Title</option>
                        </select>
                    </div>
                </div>
            </nav>
            <div className="body-container">
                <div className='data-container'>
                {Object.keys(sortedTickets).map(group => (
                <div key={group} className="column">
                    <div className='column-head'>
                        <div className='sub-container'>
                            <h1 className='group-heading'>{group}</h1>
                            <p className='count'>{sortedTickets[group].length}</p>
                        </div>
                        <div className='sub-container'>
                            <img src={add} className='icon' alt='add'/>
                            <img src={dots} className='icon' alt='dots'/>
                        </div>
                    </div>
                    {sortedTickets[group].map(ticket => (
                        <div className='card-container'>
                            <h1 className='card-id'>{ticket.id}</h1>
                            <p className='card-title'>{ticket.title}</p>
                            <p className='card-tag'>{ticket.tag[0]}</p>
                        </div>
                    ))}
                </div>
                ))}
                </div>
            </div>
            </>
        )
    }
}

export default KanbanBoard