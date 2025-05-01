import { useEffect, useState } from 'react';
import styles from './App.module.css';
import { FaRegTrashAlt, FaSun, FaMoon, FaEdit, FaSave } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

interface Task {
  id: number;
  text: string;
  done: boolean;
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [text, setText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'done' | 'todo'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    document.body.className = theme === 'dark' ? styles.dark : '';
  }, [theme]);

  const addTask = () => {
    if (!text.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      text,
      done: false,
    };
    setTasks([newTask, ...tasks]);
    setText('');
  };

  const toggleDone = (id: number) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, done: !task.done } : task));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'done') return task.done;
    if (filter === 'todo') return !task.done;
    return true;
  });

  const startEdit = (id: number, currentText: string) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const saveEdit = (id: number) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, text: editText } : task));
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className={styles.container}>
      <button className={styles.toggleTheme} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </button>

      <h1 className={styles.title}>Gerenciador de Tarefas</h1>

      <div className={styles.inputGroup}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nova tarefa" />
        <button onClick={addTask}>Adicionar</button>
      </div>

      <div className={styles.filtros}>
        <button onClick={() => setFilter('all')}>Todas</button>
        <button onClick={() => setFilter('done')}>Concluídas</button>
        <button onClick={() => setFilter('todo')}>Pendentes</button>
      </div>

      <AnimatePresence>
        <ul className={styles.taskList}>
          {filteredTasks.map(task => (
            <motion.li
              key={task.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.taskItem}
            >
              <input type="checkbox" checked={task.done} onChange={() => toggleDone(task.id)} />
              {editingId === task.id ? (
                <input
                  className={styles.taskTitle}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                />
              ) : (
                <span className={`${styles.taskTitle} ${task.done ? styles.done : ''}`}>{task.text}</span>
              )}
              <div className={styles.taskActions}>
                {editingId === task.id ? (
                  <button onClick={() => saveEdit(task.id)}><FaSave /></button>
                ) : (
                  <button onClick={() => startEdit(task.id, task.text)}><FaEdit /></button>
                )}
                <button onClick={() => deleteTask(task.id)}><FaRegTrashAlt /></button>
              </div>
            </motion.li>
          ))}
        </ul>
      </AnimatePresence>
    </div>
  );
}
