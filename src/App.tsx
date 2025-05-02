import { useEffect, useState } from 'react';
import styles from './App.module.css';
import { FaRegTrashAlt, FaSun, FaMoon, FaEdit, FaSave, FaPlus } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

interface Task {
  id: number;
  text: string;
  done: boolean;
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [text, setText] = useState('');
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [filter, setFilter] = useState<'all' | 'done' | 'todo'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    document.body.className = theme === 'dark' ? styles.dark : '';
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

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
    if (!editText.trim()) return;
    setTasks(tasks.map(task => task.id === id ? { ...task, text: editText } : task));
    setEditingId(null);
    setEditText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.toggleTheme} 
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        aria-label="Alternar tema"
      >
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </button>

      <h1 className={styles.title}>Gerenciador de Tarefas</h1>

      <div className={styles.inputGroup}>
        <input 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          onKeyDown={handleKeyDown}
          placeholder="Nova tarefa..." 
          aria-label="Adicionar nova tarefa"
        />
        <button onClick={addTask} aria-label="Adicionar">
          <FaPlus />
        </button>
      </div>

      <div className={styles.filtros}>
        <button 
          onClick={() => setFilter('all')} 
          className={filter === 'all' ? styles.active : ''}
        >
          Todas
        </button>
        <button 
          onClick={() => setFilter('todo')} 
          className={filter === 'todo' ? styles.active : ''}
        >
          Pendentes
        </button>
        <button 
          onClick={() => setFilter('done')} 
          className={filter === 'done' ? styles.active : ''}
        >
          Concluídas
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        <ul className={styles.taskList}>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.emptyState}
            >
              {filter === 'all' 
                ? 'Nenhuma tarefa encontrada. Adicione uma nova tarefa!' 
                : filter === 'done' 
                  ? 'Nenhuma tarefa concluída.' 
                  : 'Todas as tarefas estão concluídas!'}
            </motion.div>
          ) : (
            filteredTasks.map(task => (
              <motion.li
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={styles.taskItem}
              >
                <input 
                  type="checkbox" 
                  className={styles.taskCheckbox}
                  checked={task.done} 
                  onChange={() => toggleDone(task.id)}
                  aria-label={task.done ? 'Marcar como pendente' : 'Marcar como concluída'}
                />
                
                {editingId === task.id ? (
                  <input
                    className={styles.taskTitle}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                    autoFocus
                  />
                ) : (
                  <span className={`${styles.taskTitle} ${task.done ? styles.done : ''}`}>
                    {task.text}
                  </span>
                )}
                
                <div className={styles.taskActions}>
                  {editingId === task.id ? (
                    <button 
                      onClick={() => saveEdit(task.id)}
                      aria-label="Salvar edição"
                    >
                      <FaSave />
                    </button>
                  ) : (
                    <button 
                      onClick={() => startEdit(task.id, task.text)}
                      aria-label="Editar tarefa"
                    >
                      <FaEdit />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className={styles.delete}
                    aria-label="Excluir tarefa"
                  >
                    <FaRegTrashAlt />
                  </button>
                </div>
              </motion.li>
            ))
          )}
        </ul>
      </AnimatePresence>
    </div>
  );
}