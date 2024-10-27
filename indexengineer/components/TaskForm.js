import { useState } from 'react';

export default function TaskForm({ onSubmit, initialData }) {
  const [task, setTask] = useState(initialData || {
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    category: 'Personal'
  });

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(task);
    if (!initialData) {
      setTask({ title: '', description: '', dueDate: '', priority: 'Medium', category: 'Personal' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="title"
        value={task.title}
        onChange={handleChange}
        placeholder="Task title"
        required
        className="w-full p-2 border rounded"
      />
      <textarea
        name="description"
        value={task.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full p-2 border rounded"
      />
      <input
        type="date"
        name="dueDate"
        value={task.dueDate}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <select
        name="priority"
        value={task.priority}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <select
        name="category"
        value={task.category}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="Personal">Personal</option>
        <option value="Work">Work</option>
        <option value="Study">Study</option>
      </select>
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
        {initialData ? 'Update Task' : 'Add Task'}
      </button>
    </form>
  );
}